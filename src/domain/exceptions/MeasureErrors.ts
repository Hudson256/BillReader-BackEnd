export namespace MeasureErrors {
    export class InvalidData extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'InvalidData';
        }
    }

    export class MeasureNotFound extends Error {
        constructor() {
            super('Leitura não encontrada');
            this.name = 'MeasureNotFound';
        }
    }

    export class ConfirmationDuplicate extends Error {
        constructor() {
            super('Leitura já confirmada');
            this.name = 'ConfirmationDuplicate';
        }
    }

    export class InvalidType extends Error {
        constructor() {
            super('Tipo de medição não permitida');
            this.name = 'InvalidType';
        }
    }

    export class MeasuresNotFound extends Error {
        constructor() {
            super('Nenhuma leitura encontrada');
            this.name = 'MeasuresNotFound';
        }
    }

    export class DoubleReport extends Error {
        constructor() {
            super('Já existe uma leitura para este tipo no mês atual');
            this.name = 'DoubleReport';
        }
    }
}
