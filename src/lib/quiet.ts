/**
 * @module parjs
 */ /** */
import {AnyParser} from "./any";
import {ReplyKind, QuietReply} from "./reply";
import {LoudParser} from "./loud";
import {UserState} from "./internal/implementation/state";
import {ImplicitAnyParser, ImplicitLoudParser} from "./convertible-literal";

/**
 * A predicate over the user state, for parsers that don't produce results.
 * @see ParjsProjection
 */
export interface ParjsProjectionQuiet<T> {
    (userState : UserState) : T;
}
/**
 * A predicate over the user state, for parsers that don't produce results.
 * @see ParjsPredicate
 */
export type ParjsPredicateQuiet = ParjsProjectionQuiet<boolean>

/**
 * Interface for parsers that don't produce return values.
 * @see LoudParser
 *
 * @group functional
 */
export interface QuietParser extends AnyParser {
    /**
     * Applies `this` on the input, with the given initial state.
     * @param input The input string.
     * @param initialState The initial user state. The properties of this object are merged with those of the invocation's user state.
     */
    parse(input : string,initialState ?: UserState) : QuietReply;

    //+++ ALTERNATIVE

    /**
     * The returned parser will try to apply `this`. If `this` fails softly, it will try to apply each parser in `alt` until one succeeds.
     * The returned parser will propagate hard failures.
     * @param alt The alternative parsers.
     *
     * @group combinator failure-recovery alternatives
     */
    or(...alt : QuietParser[]) : QuietParser;

    /**
     * The returned parser will try to apply `this`. If it fails hard, the returned parser will fail softly, letting you use alternatives.
     * @group combinator failure-recovery
     */
    soft : QuietParser;

    /**
     * The returned parser will apply `this` and then call the given projection on the user state. The returned parser will then return the projection's result.
     * @param selector
     * @group combinator projection
     */
    map<T>(selector : ParjsProjectionQuiet<T>) : LoudParser<T>;


    /**
     * The returned parser will apply `this`, and then call the specified function on the user state.
     * @param action The function to call.
     * @group combinator projection
     */
    each(action : ParjsProjectionQuiet<void>) : QuietParser;

    //+ Look Ahead

    /**
     * The returned parser will apply `this`. If `this` succeeds, the returned parser will backtrack to the original position in the input, effectively succeeding without consuming input.
     *
     * @group combinator special backtrack
     */
    readonly backtrack: QuietParser;

    /**
     * The returned parser will apply `this`. If `this` succeeds without consuming input, the returned parser will fail hard or with the severity given in `fail`.
     * @param fail The failure kind. Defaults to hard.
     * @group combinator assertion
     */
    mustCapture(fail ?: ReplyKind.Fail) : QuietParser;

    /**
     * The returned parser will apply `this`, and then call the given predicate on the user state. If the predicate returns false,
     * the returned parser will fail hard or with the severity given by `fail`.
     * @param condition The predicate.
     * @param fail The failure severity.
     *
     * @group combinator assertion
     */
    must(condition : ParjsPredicateQuiet, fail : ReplyKind.Fail) : QuietParser;
    /**
     * The `then` methods return a parser that will apply additional parsers immediately after this one.
     * If a parser is given and it is quiet, the returned parser will be a quiet parser.
     * If the given parser is loud, the returned parser will yield its value.
     * If an array of loud and quiet parsers is given, the returned parser will yield the results of all loud parsers in an array.
     *
     * @group combinator sequential
     */
    then(second ?: QuietParser) : QuietParser;
    then<T>(next : ImplicitLoudParser<T>) : LoudParser<T>;
    then<T>(parsers : [ImplicitLoudParser<T>]) : LoudParser<[T]>;
    then<T1, T2>(parsers : [ImplicitLoudParser<T1>, ImplicitLoudParser<T2>]) : LoudParser<[T1, T2]>;
    then<T1, T2, T3>(parsers : [ImplicitLoudParser<T1>, ImplicitLoudParser<T2>, ImplicitLoudParser<T3>]) : LoudParser<[T1, T2, T3]>;
    then<S = undefined>(parsers : (QuietParser | ImplicitLoudParser<S>)[]) : LoudParser<S[]>;


    /**
     * Returns a parser that will apply `this` repeatedly, until it fails softly.
     * @param minSuccess Optionally, if `this` succeeds fewer times than this number, the returned parser will fail hard.
     * @param maxIterations Optionally, the maximum number of times `this` is applied.
     *
     * @group combinator sequential repetition
     */
    many(minSuccess ?: number, maxIterations ?: number) : QuietParser;

    /**
     * Returns a parser that will apply `this` and `till` repeatedly, as long as `till` fails softly (without consuming input).
     * If `this` fails before `till`, behavior is determined by the `tillOptional` parameter.
     * @param till The parser that tells the returned parser to stop repeating `this`.
     * @param tillOptional If true, the returned parser will stop applying `this` if it fails softly.
     *
     * @group combinator sequential repetition
     */
    manyTill(till : ImplicitAnyParser, tillOptional ?: boolean) : QuietParser;

    /**
     * The returned parser will apply `this`, and then apply the `till` predicate to the result. If the `till` predicate returns false, the process repeats.
     * If `this` fails softly, the behavior is determined by the `tillOptional` parameter.
     * @param till The predicate that determines whether iterating `this` should be stopped.
     * @param tillOptional Whether it's okay for `this` to fail softly before `till` returns false.
     *
     * @group combinator sequential repetition
     */
    manyTill(till : ParjsPredicateQuiet, tillOptional ?: boolean) : QuietParser;

    /**
     * Returns a parser that will apply `this` and then `delimeter` repeatedly, until either fails softly.
     * If `this` fails softly after `delimeter` has succeeded, the returned parser will backtrack to before `delimeter` succeeded.
     * @param delimeter The delimeter parser.
     * @param max The maximum number of times `this` is applied.
     *
     * @group combinator sequential repetition
     */
    manySepBy(delimeter : ImplicitAnyParser, max ?: number) : QuietParser;

    /**
     * The returned parser will apply `this` exactly `count` times.
     * @param count The number of times to apply `this`.
     *
     * @group combinator sequential repetition
     */
    exactly(count : number) : QuietParser;

    /**
     * The returned parser will apply `this` at the current position, and will succeed if `this` succeeds or fails softly.
     * i.e. it will make `this` an optional parser.
     */
    maybe(): QuietParser;
}
