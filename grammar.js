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

    _generic_binding: ($) =>
      choice($.binding, $.function_binding, $.typedef_binding),
    binding: ($) =>
      seq(
        "val",
        choice(seq($.identifier, optional($._type_spec)), $._pattern),
        "=",
        $._expression,
        repeat(seq("and", $.identifier, "=", $._expression)),
      ),
    function_binding: ($) =>
      seq(
        choice("fn", "fun", "fnx"),
        $.identifier,
        $.param_list,
        optional($._function_ret_type),
        "=",
        $._expression,
        repeat(
          seq(
            "and",
            $.identifier,
            $.param_list,
            optional($._function_ret_type),
            "=",
            $._expression,
          ),
        ),
      ),
    _function_ret_type: ($) => seq(":", optional($.closure_spec), $._type),
    typedef_binding: ($) => seq("typedef", $.identifier, "=", $._type),

    local_block: ($) =>
      seq(
        "local",
        repeat($._generic_binding),
        "in",
        repeat($._statement),
        "end",
      ),
    impl: ($) =>
      seq("implement", $.identifier, $.param_list, "=", $._expression),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    fcall: ($) =>
      prec(2, seq(choice($.identifier, $.fcall, $.lambda), $._passed_params)),
    _passed_params: ($) =>
      prec(
        1,
        choice(
          seq("(", list($._expression), ")"),
          choice($.identifier, $._primary_expression),
        ),
      ),

    _pattern: ($) => choice($.tuple_dpattern, $.record_dpattern),
    tuple_dpattern: ($) => seq("(", list($.identifier), ")"),
    record_dpattern: ($) =>
      seq(
        "@{",
        list(field("record_assignment", seq($.identifier, "=", $.identifier))),
        optional(seq(",", "...")),
        "}",
      ),

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

    let_expr: ($) =>
      seq("let", repeat($._generic_binding), "in", $._expression, "end"),
    where_expr: ($) =>
      prec(
        1,
        seq($._expression, "where", "{", repeat($._generic_binding), "}"),
      ),
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
          seq($.identifier, repeat1(seq(".", choice($.identifier, $.index)))),
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
        $.tuple_literal,
      ),
    index: ($) => /[0-9]+/,
    number: ($) => /[0-9]+\.?[0-9]*[eE]?[+-]?[0-9]*/,
    char: ($) => seq("'", /[^'\\]|(\\.)/, "'"),
    string: ($) => seq('"', /[^"]*/, '"'),
    boolean: ($) => choice("true", "false"),
    unit: ($) => "()",
    lambda: ($) =>
      seq(
        "lam",
        choice(
          seq("(", list(seq($.identifier, optional($._type_spec))), ")"),
          $.identifier,
        ),
        optional($._type_spec),
        "=>",
        $._expression,
      ),

    tuple_literal: ($) =>
      seq(choice("@(", "'(", "("), list($._expression), ")"),
    record_literal: ($) =>
      seq(
        choice("@{", "'{"),
        list(seq($.identifier, "=", $._expression)),
        "}",
        field("type", optional($._type_spec)),
      ),

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
      prec.right(
        1,
        seq(
          choice($._type_list, $._type),
          choice("->", seq("-", $.closure_spec)),
          $._type,
        ),
      ),
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
    closure_spec: ($) => choice("<cloref1>", "<cloref>"),

    block_comment: ($) =>
      seq(
        choice("(", "/"),
        "*",
        new RustRegex("[^*]*\\*+([^/)*][^*]*\\*+)*"),
        choice(")", "/"),
      ),
    single_comment: ($) => seq("//", /.*/),
    eof_comment: ($) => seq("////", new RustRegex("(?s).*")),
    cpp_directive: ($) => /#.*/,
  },

  extras: ($) => [
    " ",
    "\t",
    "\n",
    $.single_comment,
    $.block_comment,
    $.eof_comment,
  ],
});
