/**
 * @module parjs/internal
 */ /** */
import {ParsingFailureError} from "../parsing-failure";
import {ReplyKind} from "../reply";
import {AnyParserAction} from "./action";
import {Parjs} from "../index";

export interface ErrorLocation {
    row : number;
    column : number;
}

/**
 * An object indicating trace information about the state of parsing when it was stopped.
 */
export interface Trace {
    userState : object;
    position : number;
    reason : string;
    kind : ReplyKind.Fail;
    location : ErrorLocation;
    stackTrace : AnyParserAction[];
    input : string;
}

/**
 * Used to maintain common members between SuccessReply, FailureReply, and other reply types.
 */
export interface AnyReply<T> {
    readonly kind : ReplyKind;
    readonly value : T;
}

/**
 * Indicates a success reply and contains the value and other information.
 */
export class SuccessReply<T> implements AnyReply<T>{
    kind = ReplyKind.Ok;
    constructor(public value : T){

    }

    toString() {
        return `SuccessReply: ${this.value}`;
    }

}

export class FailureReply implements AnyReply<void> {
    constructor(public trace : Trace) {

    }

    get value() : never {
        throw new ParsingFailureError(this);
    }

    get kind() {
        return this.trace.kind;
    }

    toString() {
        return Parjs.visualizer(this.trace);
    }
}

