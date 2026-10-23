(binding . (identifier) @variable )
(param_list (typed_name (identifier) @variable.parameter) )

; TODO: record/tuple members, etc. (capture is @variable.member)

; TODO: constants
(string) @string
(char) @character
(boolean) @boolean
(number) @number

(basic_type) @type.builtin
(typedef_binding . (identifier) @type.definition )

(function_binding) @function
; (function_binding . ["print", "$extfcall"]) @function.builtin
(fcall) @function.call

; (binary_expression (_expression) . (_) @operator . (_expression) )

[
  "val" 
  "and"
  ; "cloref1"
  "let"
  ; "local"
  "where"
  "end"
  "implement"
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
