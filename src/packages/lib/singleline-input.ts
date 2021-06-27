import { trim } from 'lodash';

declare global {
    interface Window {
        clipboardData: any;
    }
}

type SinglelineInputOptions = {
    maxHeight: number;
    maxLength: number;
};

/**
 * contenteditable="plaintext-only" 속성의 div에서
 * 줄바꿈을 허용하지 않고 maxlength 를 처리하는 모듈
 */
class SinglelineInput {
    dom: HTMLDivElement;
    options: SinglelineInputOptions;

    constructor(
        dom: HTMLDivElement,
        options: SinglelineInputOptions = { maxHeight: 100, maxLength: 1000 }
    ) {
        this.dom = dom;
        this.options = Object.freeze(options);

        this.assign();
    }

    assign() {
        if (
            !this.dom ||
            this.dom.nodeName !== 'DIV' ||
            this.dom.contentEditable !== 'plaintext-only'
        ) {
            return;
        }

        this.dom.addEventListener('keydown', this.handleKeydown, false);
        this.dom.addEventListener('paste', this.handlePaste, false);
    }

    detectCombineKey(e: KeyboardEvent) {
        return e.ctrlKey || e.altKey || e.metaKey;
    }

    isSpecialKey(e: KeyboardEvent) {
        // 'backspace': 8,'shift': 16,'ctrl': 17,'alt': 18,'delete': 46,
        // 'leftArrow': 37,'upArrow': 38,'rightArrow': 39,'downArrow': 40,

        return [37, 38, 39, 40, 45, 46, 8, 16, 17, 18].includes(e.keyCode);
    }

    handleKeydown = (e: KeyboardEvent) => {
        const { keyCode } = e;

        if (this.detectCombineKey(e) || this.isSpecialKey(e)) {
            return;
        }

        const hasSelection = !!window.getSelection()?.toString();

        if (keyCode === 13 || (!hasSelection && this.value.length >= this.options.maxLength)) {
            e.preventDefault();
        }
    };

    handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();

        const clipboardData = e.clipboardData || window.clipboardData;
        let pastedData = clipboardData.getData('Text') || '';

        if (!pastedData) {
            return;
        }

        const maxLength = this.options.maxLength;
        const prevLength = this.value.length;

        if (prevLength >= maxLength) {
            return;
        }

        pastedData = this.cleanLineBreak(pastedData).substr(0, maxLength - prevLength);
        document.execCommand('insertText', false, pastedData);
    };

    cleanLineBreak(val: string) {
        return trim(val)
            .replace(/\t/g, ' ')
            .replace(/(\r\n|\n|\r)/g, ' ')
            .replace(/\s{2,}/g, ' ');
    }

    focus() {
        this.dom?.focus();
    }

    blur() {
        this.dom?.blur();
    }

    setValue(val: string) {
        this.value = val;
    }

    getValue() {
        return this.value;
    }

    get value() {
        return this.dom.innerText;
    }

    set value(val: string) {
        this.dom.innerText = this.cleanLineBreak(val).substr(0, this.options.maxLength - 1);
    }
}

export default SinglelineInput;
