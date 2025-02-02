module.exports = grammar({
  name: 'aqua',

  extras: $ => [
    $._whitespace,
    $.line_comment,
    // $.block_comment
  ],

  externals: $ => [],

  word: $ => $.name,

  rules: {
    program: $ => optional($._stmts),
    _whitespace: $ => /[ \t\r\n]/,
    line_comment: $ => token(seq('#', /.*/)),
    name: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    index: $ => /[0-9]+/,
    meta: $ => seq('@', '{', optional($._attributes), '}'),
    _attributes: $ => seq($.attribute, repeat(seq(',', $.attribute)), optional(',')),
    attribute: $ => seq($.name, optional(seq(':', $._constant))),
    _constant: $ => choice(
      $.constant_int,
      $.constant_float,
      $.constant_string,
      $.constant_char,
      $.constant_bool,
      $.constant_unit,
    ),
    constant_int: $ => token.immediate(seq(
      /-?[0-9]+/,
      optional(/[a-zA-Z_][a-zA-Z0-9_]*/)
    )),
    constant_float: $ => /-?[0-9]+\.[0-9]+/,
    constant_string: $ => seq(
      $.string_quote,
      repeat(choice(
        $.string_interpolation,
        $.string_content
      )),
      $.string_quote,
    ),
    string_quote: $ => '"',
    string_content: $ => /[^$"]+/,
    string_interpolation: $ => seq('$', choice($.block, $.name)),
    constant_char: $ => seq("'", /[^']*/, "'"),
    constant_bool: $ => choice('true', 'false'),
    constant_unit: $ => seq('(', ')'),
    _stmts: $ => repeat1($._stmt),
    _stmt: $ => choice(
      $.stmt_def,
      $.stmt_type,
      $.stmt_enum,
      $.stmt_struct,
      $.stmt_val,
      $.stmt_var,
      $.stmt_expr,
      $.stmt_code,
      $.stmt_mod,
      $.stmt_use,
      $._stmt_noop
    ),
    stmt_def: $ => seq(
      optional($.meta),
      'def',
      field('name', $.name),
      field('inner', seq(
        optional(seq('[', optional($._generics), ']')),
        '(', optional($._params), ')',
        seq(':', $._type),
        choice(
          seq('=', $._expr, ';'),
          $.block
        )
      ))
    ),
    stmt_type: $ => seq(
      optional($.meta),
      'type',
      field('name', $.name),
      field('inner', seq(
        optional(seq('[', optional($._generics), ']')),
        '=',
        $._type,
        ';'
      ))
    ),
    stmt_enum: $ => seq(
      optional($.meta),
      'enum',
      field('name', $.name),
      field('inner', seq(
        optional(seq('[', optional($._generics), ']')),
        '{', optional(seq($.variant, repeat(seq(',', $.variant)), optional(','))), '}'
      ))
    ),
    variant: $ => seq(
      $.name,
      optional(
        choice(
          seq('(', optional($._types), ')'),
          seq('{', optional($._type_fields), '}'),
        )
      )
    ),
    stmt_struct: $ => seq(
      optional($.meta),
      'struct',
      field('name', $.name),
      field('inner', seq(
        optional(seq('[', optional($._generics), ']')),
        choice(
          seq('(', optional($._types), ')'),
          seq('{', optional($._type_fields), '}'),
        )
      ))
    ),
    stmt_val: $ => prec(1, seq('val', $._pattern, '=', $._expr, ';')),
    stmt_var: $ => seq('var', $._pattern, '=', $._expr, ';'),
    stmt_expr: $ => seq($._expr, ';'),
    stmt_code: $ => prec(10, seq(
      '---',
      field('lang', choice('rust', 'python')),
      optional(field('code', $.code)),
      '---'
    )),
    stmt_mod: $ => seq('mod', $.name, '{', optional($._stmts), '}'),
    stmt_use: $ => seq('use', $.name, ';'),
    code: $ => repeat1(/[^-]+|-[^-]/),
    _stmt_noop: $ => ';',
    _types: $ => seq($._type, repeat(seq(',', $._type)), optional(',')),
    _type: $ => choice(
      $.type_fun,
      $.type_record_concat,
      $.type_paren,
      $.type_nominal,
      $.type_tuple,
      $.type_record,
      $.type_array,
      $.type_unit,
      $.type_never,
      $.type_wild,
    ),
    type_fun: $ => prec(1, seq('fun', '(', optional($._types), ')', ':', $._type)),
    type_record_concat: $ => prec.left(2, seq($._type, '&', $._type)),
    type_paren: $ => seq('(', $._type, ')'),
    type_nominal: $ => prec.left(3, seq($.type_name, optional(seq('[', optional($._types), ']')))),
    type_name: $ => $.name,
    type_tuple: $ => seq('(', $._type, ',', optional($._types), ')'),
    type_record: $ => seq('{', $._type_fields, '}'),
    type_array: $ => seq('[', optional($._types), ']'),
    type_unit: $ => seq('(', ')'),
    type_never: $ => '!',
    type_wild: $ => '_',
    _type_fields: $ => seq($.type_field, repeat(seq(',', $.type_field)), optional(',')),
    type_field: $ => seq($.name, seq(':', $._type)),
    generic: $ => $.name,
    _generics: $ => seq($.generic, repeat(seq(',', $.generic)), optional(',')),
    _params: $ => seq($._param, repeat(seq(',', $._param)), optional(',')),
    _param: $ => prec(10, seq($._pattern, ':', $._type)),
    _patterns: $ => seq($._pattern, repeat(seq(',', $._pattern)), optional(',')),
    _pattern_fields: $ => seq($.pattern_field, repeat(seq(',', $.pattern_field)), optional(',')),
    pattern_field: $ => seq($.name, optional(seq(':', $._pattern))),
    _pattern: $ => choice(
      $.pattern_annot,
      $.pattern_or,
      $.pattern_record_concat,
      $.pattern_paren,
      $.pattern_constant,
      $.pattern_name,
      $.pattern_variant,
      $.pattern_tuple,
      $.pattern_record,
      $.pattern_array,
      $.pattern_wild,
    ),
    pattern_annot: $ => prec(1, seq($._pattern, ':', $._type)),
    pattern_or: $ => prec.left(2, seq($._pattern, 'or', $._pattern)),
    pattern_record_concat: $ => prec.left(2, seq($._pattern, '&', $._pattern)),
    pattern_paren: $ => seq('(', $._pattern, ')'),
    pattern_constant: $ => $._constant,
    pattern_name: $ => $.name,
    pattern_variant: $ => choice(
      seq($.variant_name, '(', optional($._patterns), ')'),
      seq($.variant_name, '{', optional($._pattern_fields), '}')
    ),
    pattern_tuple: $ => seq('(', $._pattern, ',', optional($._patterns), ')'),
    pattern_record: $ => seq('{', optional($._pattern_fields), '}'),
    pattern_array: $ => seq('[', optional($._patterns), ']'),
    pattern_wild: $ => '_',

    variant_name: $ => $.name,

    _exprs: $ => seq($._expr, repeat(seq(',', $._expr)), optional(',')),
    _expr: $ => choice(
      $.expr_return,
      $.expr_break,
      $.expr_continue,
      $.expr_throw,
      $.expr_query,
      $.expr_fun,
      $.expr_binary,
      $.expr_annot,
      $.expr_call,
      $.expr_tuple_access,
      $.expr_record_access,
      $.expr_array_access,
      $.expr_method_call,
      $.expr_paren,
      $.expr_constant,
      $.expr_name,
      $.expr_array,
      $.expr_tuple,
      $.expr_record,
      $.expr_do,
      $.expr_if,
      $.expr_match,
      $.expr_loop,
      $.expr_while,
      $.expr_for,
      $.expr_try,
      $.expr_record_variant,
      // $._expr_inject,
    ),
    expr_return: $ => prec.left(1, seq('return', optional($._expr))),
    expr_break: $ => prec.left(1, seq('break', optional($._expr))),
    expr_continue: $ => prec.left(1, 'continue'),
    expr_throw: $ => prec.left(1, seq('throw', $._expr)),
    expr_query: $ => prec.left(2, seq($.query_from, optional($._query_stmts))),
    _rust: $ => seq('{', repeat(choice(/[^{}]+/, $._rust)), '}'),
    _query_stmts: $ => repeat1($._query_stmt),
    _query_stmt: $ => choice(
      $.query_from,
      $.query_where,
      $.query_join,
      $.query_union,
      $.query_group,
      $.query_over,
      $.query_select,
      $.query_roll,
      $.query_compute,
      $.query_select,
      $.query_into,
      $.query_order,
      $.query_val,
    ),

    query_from: $ => seq('from', $._pattern, 'in', $._expr),
    query_where: $ => seq('where', $._expr),
    query_join: $ => seq('join', $._pattern, 'in', $._expr, 'on', $._expr),
    query_union: $ => seq('union', $._expr),
    query_group: $ => prec.left(2, seq('group', $._expr, optional($._as), '{', optional($._query_stmts), '}', optional($._as))),
    query_over: $ => prec.left(2, seq('over', $._expr, '{', optional($._query_stmts), '}', optional($._as))),
    query_roll: $ => prec.left(2, seq('roll', $._expr, optional($._of), optional($._as))),
    query_compute: $ => prec.left(2, seq('compute', $._expr, optional($._of), optional($._as))),
    query_select: $ => prec.left(2, seq('select', $._expr, optional($._as))),
    query_val: $ => prec.left(2, seq('with', $._pattern, '=', $._expr)),
    query_into: $ => seq('into', $._expr),
    query_order: $ => prec.left(2, seq('order', $._expr, optional('desc'))),

    _as: $ => seq('as', $.name),
    _of: $ => seq('of', $._expr),

    expr_fun: $ => prec.left(2, seq(
      'fun',
      '(', $._patterns, ')',
      optional(seq(':', $._type)),
      choice(
        seq('=', $._expr),
        $.block
      )
    )),
    expr_binary: $ => choice(
      prec.left(1, seq($._expr, choice('=', '+=', '-=', '*=', '/='), $._expr)),
      prec.left(2, seq($._expr, choice('..', '..='), $._expr)),
      prec.left(3, seq($._expr, choice('and', 'or'), $._expr)),
      prec.left(4, seq($._expr, choice('==', '!='), $._expr)),
      prec.left(5, seq($._expr, choice('<', '>', '<=', '>='), $._expr)),
      prec.left(6, seq($._expr, choice('+', '-'), $._expr)),
      prec.left(7, seq($._expr, choice('*', '/'), $._expr)),
    ),
    expr_unary: $ => prec(8, seq(choice('not', '-', '+'), $._expr)),
    expr_annot: $ => prec(9, seq($._expr, ':', $._type)),
    expr_call: $ => prec(10, seq(
      field('function', $._expr),
      optional(seq('::', '[', $._types, ']')),
      '(', optional($._exprs), ')')
    ),
    expr_tuple_access: $ => prec(11, seq($._expr, '.', $.index)),
    expr_record_access: $ => prec(11, seq($._expr, '.', $.name)),
    expr_array_access: $ => prec(11, seq($._expr, '[', $._expr, ']')),
    expr_method_call: $ => prec(12, seq(
      $._expr,
      '.',
      field('name', $.name),
      optional(seq('::', '[', $._types, ']')),
      '(', optional($._exprs), ')'
    )),
    expr_record_variant: $ => prec(13, seq($.name, '{', optional($._expr_fields), '}')),
    expr_paren: $ => seq('(', $._expr, ')'),
    expr_constant: $ => $._constant,
    expr_name: $ => prec(14, $.name),
    expr_array: $ => seq('[', optional($._exprs), ']'),
    expr_tuple: $ => seq('(', $._expr, ',', optional($._exprs), ')'),
    expr_record: $ => seq('{', optional($._expr_fields), '}'),
    _expr_fields: $ => seq($.expr_field, repeat(seq(',', $.expr_field)), optional(',')),
    expr_field: $ => choice(
      $.expr_field_expr,
      $.expr_field_name,
    ),
    expr_field_expr: $ => prec(15, seq($.name, optional(seq(':', $._expr)))),
    expr_field_name: $ => prec(2, seq($._expr, '.', $.name)),
    expr_do: $ => seq('do', $.block),
    expr_if: $ => seq('if', $._expr, $.block, optional(seq('else', $.block))),
    expr_match: $ => seq('match', $._expr, '{', $._arms, '}'),
    expr_loop: $ => seq('loop', $.block),
    expr_while: $ => seq('while', $._expr, $.block),
    expr_for: $ => seq('for', $._pattern, 'in', $._expr, $.block),
    expr_try: $ => seq('try', $.block, 'catch', '{', optional($._arms), '}', 'finally', $.block),
    block: $ => seq('{', optional($._stmts), optional($._expr), '}'),
    _arms: $ => seq($.arm, repeat(seq(',', $.arm)), optional(',')),
    arm: $ => field('arm', seq($._pattern, '=>', $._expr)),
  }
});
