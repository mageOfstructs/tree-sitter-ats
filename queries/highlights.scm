(binding . (identifier) @variable )
(binding "and" . (identifier) @variable )
(param_list (typed_name (identifier) @variable.parameter) )
(record_dpattern record_assignment: (identifier) @variable )
(binary_expression (identifier) @variable )
(unary_expression (identifier) @variable )

; TODO: record/tuple members, etc. (capture is @variable.member)

; TODO: constants
(string) @string
(char) @character
(boolean) @boolean
(number) @number

(basic_type) @type.builtin
(typedef_binding . (identifier) @type.definition )

(function_binding) @function
((function_binding) @function.builtin
 (#any-of? @function.builtin 
    "print"
    "$extfcall"))
(fcall) @function.call

; (binary_expression (_expression) . (_) @operator . (_expression) )

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
] @keyword.function

[
 "andalso"
 "orelse"
 "not"
] @keyword.operator

; [ "if" "else" ] @keyword.conditional

[
 (single_comment)
 (block_comment)
] @comment
