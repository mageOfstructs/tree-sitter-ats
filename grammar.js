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
    source_file: ($) =>
      repeat(
        choice(
          $.binding,
          $.function_binding,
          $.typedef_binding,
          $.cpp_directive,
          $.impl,
        ),
      ),

    binding: ($) =>
      seq(
        "val",
        $.identifier,
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

    impl: ($) =>
      seq("implement", $.identifier, $.param_list, "=", $._expression),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    fcall: ($) =>
      seq(
        $.identifier,
        "(",
        optional(seq($._expression, repeat(seq(",", $._expression)))),
        ")",
      ),

    _expression: ($) =>
      choice(
        $.identifier,
        $.fcall,
        $._primary_expression,
        $.unary_expression,
        $.binary_expression,
      ), // TODO: to define

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

    param_list: ($) =>
      seq(
        "(",
        optional(seq($.typed_name, repeat(seq(",", $.typed_name)))),
        ")",
      ),

    _primary_expression: ($) => choice($.number, $.string, $.unit),
    number: ($) => /[0-9]+\.?[0-9]*[eE]?[+-]?[0-9]*/,
    string: ($) => seq('"', /[^"]*/, '"'),
    unit: ($) => "()",

    typed_name: ($) => seq($.identifier, $._type_spec),
    _type_spec: ($) => seq(":", $._type),
    _type: ($) => choice($.basic_type, $.tuple_type, $.identifier),
    tuple_type: ($) =>
      seq("(", optional(seq($._type, repeat(seq(",", $._type)))), ")"),
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
