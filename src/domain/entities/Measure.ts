export class Measure {
    private _isConfirmed: boolean = false;
    private _confirmedValue: number | null = null;

    constructor(
        public readonly measureUuid: string,
        public readonly customerCode: string,
        public readonly measureDatetime: Date,
        public readonly measureType: 'WATER' | 'GAS',
        public readonly measureValue: number,
        public readonly imageUrl: string
    ) {}

    get isConfirmed(): boolean {
        return this._isConfirmed;
    }

    get confirmedValue(): number | null {
        return this._confirmedValue;
    }

    confirm(value: number): void {
        if (this._isConfirmed) {
            throw new Error('Medição já confirmada');
        }
        this._isConfirmed = true;
        this._confirmedValue = value;
    }
}

export enum MeasureType {
    WATER = 'WATER',
    GAS = 'GAS'
}
