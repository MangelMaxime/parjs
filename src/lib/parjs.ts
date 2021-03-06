/**
 * @module parjs
 */
/** */
import {LoudParser, ParjsPredicate} from "./loud";
import {FloatOptions} from "./internal/implementation/parsers/numbers/float";
import {IntOptions} from "./internal/implementation/parsers/numbers/int";
import {QuietParser} from "./quiet";
import {AnyParser} from "./any";
import {ReplyKind} from "./reply";
import {AnyParserAction} from "./internal/action";
import {TraceVisualizer} from "./internal/visualizer";
import {UserState} from "./internal/implementation/state";
import {ImplicitAnyParser, ImplicitLoudParser} from "./convertible-literal";

/**
 * Helper methods for working with Parjs parsers.
 */
export interface ParjsStaticHelper {
    isParser(obj: any): obj is AnyParser;

    isParserAction(obj: any): obj is AnyParserAction;
}

/**
 * An object with one or more parser-valued properties. Each property specifies a parser to apply. Used by [[ParjsStatic.seqObject]].
 */
export type ParserSpecification<Obj extends Record<string, any>> = {
    [key in keyof Obj]: ImplicitLoudParser<Obj[key]>
}

/**
 * Namespace for static combinators and building-block parsers.
 *
 * @group functional
 */
export interface ParjsStatic {

    /**
     * Helpers for working with Parjs parser objects.
     */
    readonly helper: ParjsStaticHelper;

    //++ INFRASTRUCTURE
    /**
     * Used to visualize parsing errors in plain-text.
     */
    visualizer: TraceVisualizer;

    //++ PARSERS

    /**
     * Returns a parser that will parse a single character and yield it.  If it can't, it will fail softly.
     *
     * @group basic-parser character
     */
    readonly anyChar: LoudParser<string>;

    /**
     * Returns a parser that will parse a single character that is part of the string `chars`, and then yield it. If it can't, it will fail softly.
     * @param chars The characters to match.
     *
     * @group basic-parser character
     */
    anyCharOf(chars: string): LoudParser<string>;

    /**
     * Returns a parser that will parse a single character that is not part of the string `chars`, and then yield it.  If it can't, it will fail softly.
     * @param chars The characters not to match.
     *
     * @group basic-parser character
     */
    noCharOf(chars: string): LoudParser<string>;

    /**
     * Returns a parser that will parse a single character that matches the given predicate, and then it will yield the character.  If it can't, it will fail softly.
     * @param predicate The predicate the character must fulfill.
     *
     * @group basic-parser character
     */

    charWhere(predicate: ParjsPredicate<string>): LoudParser<string>;

    /**
     * Returns a parser that will parse a single digit character [0-9] and yield it. If it can't, it will fail soflty.
     *
     * @group basic-parser character numeric
     */
    readonly digit: LoudParser<string>;

    /**
     * Returns a parser that will parse a single hex digit character [0-9a-fA-F] and yield it. If it can't, it will fail soflty.
     *
     * @group basic-parser character numeric
     */
    readonly hex: LoudParser<string>;

    /**
     * Returns a parser that will parse a single lower-case letter character in the range [a-z] and yield it. If it can't, it will fail soflty.
     *
     * @group basic-parser character
     */
    readonly lower: LoudParser<string>;

    /**
     * Returns a parser that will parse a single letter [a-zA-Z] and yield it. If it can't, it will fail softly.
     *
     * @group basic-parser character
     */
    readonly letter: LoudParser<string>;

    /**
     * Returns a parser that will parse a single upper-case letter character in the range [A-Z] and yield it. If it can't, it will fail softly.
     *
     * @group basic-parser character
     */
    readonly upper: LoudParser<string>;


    /**
     * Returns a parser that will parse either \n, \r\n, or \r and yield the string that was parsed. If it can't, it will fail softly.
     *
     * @group basic-parser character
     */
    readonly newline: LoudParser<string>;

    /**
     * Returns a parser that will parse a single Unicode newline string, including characters as \u2029 (PARAGRAPH SEPARATOR) that may indicate newlines. Returns the string that was parsed.
     * If it can't, it will fail softly.
     *
     * @group basic-parser character unicode
     * @requires module:parjs/unicode
     */
    readonly uniNewline: LoudParser<string>;

    /**
     * Returns a parser that will parse a single Unicode lowercase character in any script or language. It will yield the string that was parsed.
     *
     * @group basic-parser character unicode
     * @requires module:parjs/unicode
     */
    readonly uniLower: LoudParser<string>;
    /**
     * Returns a parser that will parse a single Unicode letter character in any script or language. It will yield the string that was parsed.
     *
     * @group basic-parser character unicode
     * @requires module:parjs/unicode
     */
    readonly uniLetter: LoudParser<string>;

    /**
     * Returns a parser that will parse a single Unicode uppercase character in any script or language. It will yield the string that was parsed.
     *
     * @group basic-parser character unicode
     * @requires module:parjs/unicode
     */
    readonly uniUpper: LoudParser<string>;

    /**
     * Returns a parser that will parse a single Unicode digit character in any script or language. It will yield the string that was parsed.
     *
     * @group basic-parser character unicode numeric
     * @requires module:parjs/unicode
     */
    readonly uniDigit: LoudParser<string>;
    /**
     * Returns a parser that will parse one ASCII inline space character, such as space or a tab, and yield it.
     * If it can't, it will fail softly.
     *
     * @group basic-parser character
     *
     */
    readonly space: LoudParser<string>;

    /**
     * Returns a parser that will parse one Unicode inline space character, including characters such as EM SPACE, and yield the character that was parsed.
     * If it can't, it will fail softly.
     *
     * @group basic-parser character unicode
     * @requires module:parjs/unicode
     */
    readonly uniSpace: LoudParser<string>;

    //+ NUMERIC
    /**
     * Returns a parser that will parse an integer according to the format options given in `options`, and yield the integer that was parsed (as a number).
     * The returned parser will normally either succeed or fail softly, but some kinds of inputs will cause a hard failure, such as a sign without any digits after it.
     * @param options The format of the integer.
     *
     * @group basic-parser numeric
     */
    int(options ?: IntOptions): LoudParser<number>;

    /**
     * Returns a parser that will parse a single floating point number according to the format options given in `options`, and yield it (as a number).
     * The returned parser will fail softly if the input is not a floating point number, but it will fail hard if it suspects the input is a malformed floating point number.
     * For example, 1.0e+ will cause it to fail hard.
     * @param options The floating point format options.
     *
     * @group basic-parser numeric
     */
    float(options ?: FloatOptions): LoudParser<number>


    //+ PRIMTIIVE

    /**
     * Returns a parser that will succeed without consuming input and yield the given value.
     * @param result The value to yield.
     *
     * @group basic-parser primitive
     */
    result<T>(result: T): LoudParser<T>;

    /**
     * Returns a parser that will succeed without consuming input. Quiet parser.
     *
     * @group basic-parser primitive
     */
    readonly nop: QuietParser;

    /**
     * Returns a parser that will succeed if it has reached the end of the input, and fail softly otherwise.
     *
     * @group basic-parser primitive
     */
    readonly eof: QuietParser;

    /**
     * Returns a parser that will fail with the severity specified by `kind`, regardless of the input.
     * @param expecting Optionally, a text indicating why the parser failed.
     * @param kind The failure kind. Defaults to hard.
     *
     * @group basic-parser primitive
     */
    fail(expecting ?: string, kind ?: ReplyKind.Fail): LoudParser<any>;

    //+ SPECIAL

    /**
     * Returns a parser that will succeed without consuming input and yield the current position in the input.
     *
     * @group basic-parser primitive
     */
    readonly position: LoudParser<number>;

    /**
     * Returns a parser that will succeed without consuming input and yield the current user state.
     *
     * @group basic-parser primitive
     */
    readonly state: LoudParser<any>;

    //+ STRING

    /**
     * Returns a parser that will parse as many ASCII whitespace characters as possible, including any number of spaces, tabs, and newlines. Returns the parsed text.
     * The returned parser will always succeed.
     *
     * @group basic-parser string
     */
    readonly whitespaces: LoudParser<string>;

    /**
     * Returns a parser that will parse one or more ASCII whitespace character and yield the result.
     * The returned parser will fail softly if it can't parse at least one space character.
     *
     * @group basic-parser string
     */
    readonly spaces1: LoudParser<string>;

    /**
     * Returns a parser that parses as many Unicode inline white spaces as possible. Returns the parsed text.
     * The returned parser will always succeed.
     *
     *  @group basic-parser string unicode
     *  @requires module:parjs/unicode
     *
     */
    readonly uniSpaces: LoudParser<string>;

    /**
     * Returns a parser that will parse all the characters until the end of the input, and then yield the parsed text.
     * The returned parser will never fail.
     *
     *  @group basic-parser string
     */
    readonly rest: LoudParser<string>;

    /**
     * Returns a parser that will try to parse the string `str`. The returned parser will yield the parsed string if it succeeds, and fail softly otherwise.
     * @param str The string to parse.
     *
     *  @group basic-parser string
     */
    string(str: string): LoudParser<string>;

    /**
     * Returns a parser that will try to parse the strings in `strings` in order, and it will yield the string that was parsed.
     * The returned parser will fail softly if none of the strings can be parsed.
     * @param strings The strings.
     *
     *  @group basic-parser string
     */
    anyStringOf(...strings: string[]): LoudParser<string>;

    /**
     * Returns a parser that will parse exactly `length` characters and yield the string that was parsed.
     * The returned parser will fail softly if the input does not contain that many characters, and succeed otherwise.
     * @param length The number of characters to parse.
     *
     *  @group basic-parser string
     */
    stringLen(length: number): LoudParser<string>;

    /**
     * Returns a parser that will apply `regexp` on the input. It will succeed only if `regexp` matches at the current position.
     * The returned parser will consume all the (consecutive) input matched by the regex.
     * The returned parser will yield the resulting match array, with result[0] being the entire match and result[n] being group n.
     * The returned parser will fail softly if `regexp` failed.
     * @param regexp The regexp to apply. The global flag will not be respected.
     * @group basic-parser string regex
     */
    regexp(regexp: RegExp): LoudParser<string[]>;


    //+ STATIC COMBINATORS

    /**
     * The first time the returned parser that is invoked, it will call `resolver` with no arguments and cache the result. From that point, it will act like the parser returned by `resolver`.
     * This late binding can be used to create certain kinds of recursive parsers.
     * @param resolver
     *
     *  @group combinator special
     */
    late<T>(resolver: () => LoudParser<T>): LoudParser<T>;

    /**
     * Returns a parser that will try to apply the given parsers at the current position, one after the other, until one of them succeeds. It will yield its result.
     * The returned parser will fail softly if none of the parsers succeeds, and fail hard if any of them fails hard.
     * @param pars The parsers.
     *
     * @group combinator failure-recovery alternatives
     */
    any(...pars: ImplicitLoudParser<any>[]): LoudParser<any>;

    /**
     * Returns a parser that will apply the parsers defined in the properties of `parsers`, in the order given by `ordering`.
     * If `ordering` is `null`, the own properties of `parsers` will be enumerated, and the parsers will be applied in the order in which they appear in the enumeration, which may be unpredictable.
     *
     * The returned parser will yield an object containing each parser property in `parsers`, with the value of that parser's result.
     * @template TObj
     * @returns {LoudParser<TObj>}
     */
    seqObject<O1, O2 = {}, O3 = {}, O4 = {}, O5 = {}, O6 = {}, O7 = {}, O8 = {}, O9 = {}, O10 = {}, O11 = {}>(
        p1: ParserSpecification<O1>,
        p2 ?: ParserSpecification<O2>,
        p3 ?: ParserSpecification<O3>,
        p4 ?: ParserSpecification<O4>,
        p5 ?: ParserSpecification<O5>,
        p6 ?: ParserSpecification<O6>,
        p7 ?: ParserSpecification<O7>,
        p8 ?: ParserSpecification<O8>,
        p9 ?: ParserSpecification<O9>,
        p10 ?: ParserSpecification<O10>,
        p11 ?: ParserSpecification<O11>
    )
        : LoudParser<O1 & O2 & O3 & O4>;

    /**
     * Returns a parser that will try to apply the given parsers at the current position, one after the other, until one of them succeeds.
     * The returned parser will fail soflty if none of the parsers succeeds, and fail hard if any of them fails hard.
     * @param pars The quiet parsers to try.
     *
     * @group combinator failure-recovery alternatives
     */
    any(...pars: QuietParser[]): QuietParser;

    /**
     * Returns a parser that will apply the specified parsers in sequence and yield the results in an array.
     * @param parsers The parser sequence.
     *
     * @group combinator sequential
     */
    seq(...parsers: ImplicitAnyParser[]): LoudParser<any[]>;

    /**
     * Returns a parser that, when called, will call the `parserChooser` function on the current parsing state.
     * The returned parser will behave like the parser returned by this function.
     * @param {(userState: UserState) => TParser1} parserChooser A function for choosing which parser to apply based on user state.
     */
    choose<TParser1>(parserChooser: (userState: UserState) => TParser1);
}