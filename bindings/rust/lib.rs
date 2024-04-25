//! This crate provides arc-lang language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][language func] function to add this language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

extern "C" {
    fn tree_sitter_aqua() -> Language;
}

/// Get the tree-sitter [Language][] for this grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_aqua() }
}

/// The content of the [`node-types.json`][] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES: &str = include_str!("../../src/node-types.json");

/// Queries for syntax highlighting and other language features.
pub const HIGHLIGHTS_QUERY: &str = include_str!("../../queries/aqua/highlights.scm");
pub const INJECTIONS_QUERY: &str = include_str!("../../queries/aqua/injections.scm");
pub const LOCALS_QUERY: &str = include_str!("../../queries/aqua/locals.scm");
pub const TAGS_QUERY: &str = include_str!("../../queries/aqua/tags.scm");
pub const HIGHLIGHT_NAMES: &[&str] = &[
    "string",
    "number",
    "boolean",
    "comment",
    "keyword",
    "function",
    "variable",
    "type",
    "type.builtin",
    "conditional",
    "repeat",
    "punctuation",
    "operator",
];

pub struct TreeSitterError(String);

impl std::fmt::Debug for TreeSitterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}
