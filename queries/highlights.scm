(binding . (identifier) @variable )
(binding "and" . (identifier) @variable )
(param_list (typed_name (identifier) @variable.parameter) )
(record_dpattern record_assignment: (identifier) @variable )
(lambda (identifier) @variable)
(binary_expression (identifier) @variable )
(unary_expression (identifier) @variable )
(unary_expression (index) @variable.member )

; TODO: record/tuple members, etc. (capture is @variable.member)

; TODO: constants
(string) @string
(char) @character
(boolean) @boolean
(number) @number

(basic_type) @type.builtin
(typedef_binding . (identifier) @type.definition )

(function_binding . (identifier) @function )
(function_binding "and" . (identifier) @function )
(impl . (identifier) @function)
((function_binding) @function.builtin
 (#any-of? @function.builtin 
    "print"
    "$extfcall"))
(fcall . (identifier) @function.call )

[
 "="
 "<>"
 "<="
 ">="
 "<"
 ">"
 "~"
 "-"
 "+"
] @operator

(binary_expression ["*" "/"] @operator)

[
  "val" 
  "and"
  ; "cloref1"
  "let"
  "local"
  "in"
  "where"
  "end"
  "implement"
  "typedef"
] @keyword

[ 
  "fn"
  "fun"
  "fnx"
  "lam"
] @keyword.function

[
 "andalso"
 "orelse"
 "not"
] @keyword.operator

[ "if" "then" "else" ] @keyword.conditional

[
 (single_comment)
 (block_comment)
] @comment
