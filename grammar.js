/**
 * @file Applied Type System
 * @author mage <mageOfStructs@proton.me>
 * @license GPLv3
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "ats",

  rules: {
    // TODO: add the actual grammar rules
    source_file: ($) => repeat(choice($.binding, $.cpp_predicate, $.impl)),

    binding: ($) =>
      seq(
        "val",
        $.identifier,
        "=",
        $.expression,
        repeat(seq("and", $.identifier, "=", $.expression)),
      ),
    function_binding: ($) =>
      seq(
        choice("fn", "fun", "fnx"),
        $.identifier,
        $.param_list,
        "=",
        $.expression,
      ),

    impl: ($) =>
      seq("implement", $.identifier, $.param_list, "=", $.expression),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    fcall: ($) =>
      seq(
        $.identifier,
        "(",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        ")",
      ),

    expression: ($) => choice($.identifier, $.fcall, $._primary_expression), // TODO: to define

    param_list: ($) =>
      seq(
        "(",
        optional(seq($.identifier, repeat(seq(",", $.identifier)))),
        ")",
      ),

    _primary_expression: ($) => choice($.number, $.string, "()"),
    number: ($) => /\~?[0-9]+[eE]?[+-]?[0-9]*/,
    string: ($) => seq('"', /[^"]*/, '"'),

    block_comment: ($) =>
      seq(
        choice("(", "/"),
        "*",
        new RustRegex("[^*]*\\*+([^/)*][^*]*\\*+)*"),
        choice(")", "/"),
      ),
    single_comment: ($) => seq("//", /.*/),
    cpp_predicate: ($) => /#.*/,
  },

  extras: ($) => [" ", "\t", "\n", $.single_comment, $.block_comment],
});
