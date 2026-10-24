/**
 * @file Applied Type System
 * @author mage <mageOfStructs@proton.me>
 * @license GPLv3
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

function list(inner, delim = ",") {
  return optional(seq(inner, repeat(seq(delim, inner))));
}

export default grammar({
  name: "ats",

  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) =>
      choice(
        $.binding,
        $.function_binding,
        $.typedef_binding,
        $.cpp_directive,
        $.impl,
        $.local_block,
      ),

    binding: ($) =>
      seq(
        "val",
        $.identifier,
        optional($._type_spec),
        "=",
        $._expression,
        repeat(seq("and", $.identifier, "=", $._expression)),
      ),
    function_binding: ($) =>
      seq(
        choice("fn", "fun", "fnx"),
        $.identifier,
        $.param_list,
        optional($._type_spec),
        "=",
        $._expression,
        repeat(seq("and", $.identifier, $.param_list, "=", $._expression)),
      ),
    typedef_binding: ($) => seq("typedef", $.identifier, "=", $._type),

    local_block: ($) =>
      seq("local", repeat($.binding), "in", repeat($._statement), "end"),
    impl: ($) =>
      seq("implement", $.identifier, $.param_list, "=", $._expression),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    fcall: ($) => seq($.identifier, $._passed_params),
    _passed_params: ($) =>
      choice(seq("(", list($._expression), ")"), $._expression),

    _expression: ($) =>
      choice(
        $.identifier,
        $.fcall,
        $._primary_expression,
        $.unary_expression,
        $.binary_expression,
        $.let_expr,
        $.where_expr,
        $.if_expr,
      ),

    let_expr: ($) => seq("let", repeat($.binding), "in", $._expression, "end"),
    where_expr: ($) =>
      prec(1, seq($._expression, "where", "{", repeat($.binding), "}")),
    if_expr: ($) =>
      prec.right(
        seq(
          "if",
          $._expression,
          "then",
          $._expression,
          optional(seq("else", $._expression)),
        ),
      ),

    unary_expression: ($) =>
      prec(
        5,
        choice(
          seq("not", "(", $._expression, ")"),
          seq("~", $._expression),
          seq("(", $._expression, ")"),
        ),
      ),

    binary_expression: ($) =>
      prec.left(
        choice(
          prec(4, seq($._expression, "*", $._expression)),
          prec(4, seq($._expression, "/", $._expression)),
          prec(3, seq($._expression, "+", $._expression)),
          prec(3, seq($._expression, "-", $._expression)),
          prec(2, seq($._expression, "=", $._expression)),
          prec(2, seq($._expression, "<>", $._expression)),
          prec(2, seq($._expression, ">=", $._expression)),
          prec(2, seq($._expression, "<=", $._expression)),
          prec(2, seq($._expression, ">", $._expression)),
          prec(2, seq($._expression, "<", $._expression)),
          prec(1, seq($._expression, "andalso", $._expression)),
          prec(1, seq($._expression, "orelse", $._expression)),
        ),
      ),

    param_list: ($) => seq("(", list($.typed_name), ")"),

    _primary_expression: ($) =>
      choice(
        $.number,
        $.char,
        $.string,
        $.unit,
        $.lambda,
        $.boolean,
        $.record_literal,
      ),
    number: ($) => /[0-9]+\.?[0-9]*[eE]?[+-]?[0-9]*/,
    char: ($) => seq("'", /[^'\\]|(\\.)/, "'"),
    string: ($) => seq('"', /[^"]*/, '"'),
    boolean: ($) => choice("true", "false"),
    unit: ($) => "()",
    lambda: ($) => seq("lam", $._passed_params, "=>", $._expression),

    record_literal: ($) =>
      seq(choice("@{", "'{"), list(seq($.identifier, "=", $._expression)), "}"),

    typed_name: ($) => seq($.identifier, $._type_spec),
    _type_spec: ($) => seq(":", $._type),
    _type_list: ($) => seq("(", list($._type), ")"),
    _type: ($) =>
      choice(
        $.basic_type,
        $.tuple_type,
        $.function_type,
        $.record_type,
        $.identifier,
      ),
    tuple_type: ($) => $._type_list,
    record_type: ($) => seq("@{", list(seq($.identifier, "=", $._type)), "}"),
    function_type: ($) =>
      prec.right(1, seq(choice($._type_list, $._type), "->", $._type)),
    basic_type: ($) =>
      choice(
        "int",
        "double",
        "void",
        "bool",
        "char",
        "schar",
        "uchar",
        "float",
        "uint",
        "lint",
        "ulint",
        "llint",
        "ullint",
        "size_t",
        "ssize_t",
        "sint",
        "usint",
        "string",
      ),

    block_comment: ($) =>
      seq(
        choice("(", "/"),
        "*",
        new RustRegex("[^*]*\\*+([^/)*][^*]*\\*+)*"),
        choice(")", "/"),
      ),
    single_comment: ($) => seq("//", /.*/),
    cpp_directive: ($) => /#.*/,
  },

  extras: ($) => [" ", "\t", "\n", $.single_comment, $.block_comment],
});
