export namespace MeasureErrors {
    export class InvalidData extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'InvalidData';
        }
    }

    export class MeasureNotFound extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'MeasureNotFound';
        }
    }

    export class ConfirmationDuplicate extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ConfirmationDuplicate';
        }
    }

}
