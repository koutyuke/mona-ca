use swc_core::common::DUMMY_SP;
use swc_core::ecma::{
  ast::*,
  transforms::testing::test_inline,
  visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

pub struct TransformVisitor;

impl VisitMut for TransformVisitor {
  fn visit_mut_module_items(&mut self, items: &mut Vec<ModuleItem>) {
    items.visit_mut_children_with(self);

    let mut new_items: Vec<ModuleItem> = Vec::new();

    for item in items.drain(..) {
      match item {
        ModuleItem::Stmt(Stmt::Decl(Decl::Var(var_decl))) => {
          if let Some(import_decl) = transform_variable_to_import(&*var_decl) {
            new_items.push(ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)));
          } else {
            new_items.push(ModuleItem::Stmt(Stmt::Decl(Decl::Var(var_decl))));
          }
        }
        _ => {
          new_items.push(item);
        }
      }
    }
    *items = new_items;
  }
}

fn transform_variable_to_import(var_decl: &VarDecl) -> Option<ImportDecl> {
  if var_decl.decls.len() != 1 {
    return None;
  }

  let decl = &var_decl.decls[0];
  let init_expr = decl.init.as_ref()?;

  if let Pat::Ident(BindingIdent {
    id: Ident {
      sym: name, ctxt, ..
    },
    ..
  }) = &decl.name
  {
    if let Expr::Lit(Lit::Str(Str {
      value: src_path,
      raw,
      ..
    })) = &**init_expr
    {
      if !src_path.starts_with("./") && !src_path.ends_with(".wasm") {
        return None;
      }

      let import_default_specifier = ImportSpecifier::Default(ImportDefaultSpecifier {
        local: Ident {
          sym: name.clone(),
          span: DUMMY_SP,
          optional: false,
          ctxt: ctxt.clone(),
        },
        span: DUMMY_SP,
      });

      let import_decl = ImportDecl {
        span: DUMMY_SP,
        specifiers: vec![import_default_specifier],
        src: Box::new(Str {
          span: DUMMY_SP,
          value: src_path.clone(),
          raw: raw.clone(),
        }),
        type_only: false,
        phase: ImportPhase::Evaluation,
        with: None,
      };

      return Some(import_decl);
    }
  }

  None
}

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
  program.fold_with(&mut as_folder(TransformVisitor))
}

test_inline!(
  Default::default(),
  |_| as_folder(TransformVisitor),
  replace_wasm_variable_to_import,
  // Input codes
  r#"
  let foo = './wasm_foo-bar.wasm';
  let dummyFoo = 'dummy';
  var bar = "./wasm_foo-bar.wasm";
  var dummyBar = 'dummy';
  var wasm_argon2_bg_default = "./wasm_argon2_bg-n960sq1e.wasm";
  "#,
  // Output codes after transformed with plugin
  r#"
  import foo from './wasm_foo-bar.wasm';
  let dummyFoo = 'dummy';
  import bar from "./wasm_foo-bar.wasm";
  var dummyBar = 'dummy';
  import wasm_argon2_bg_default from "./wasm_argon2_bg-n960sq1e.wasm";
  "#
);
