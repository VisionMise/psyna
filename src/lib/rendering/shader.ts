export class Shader {

    private shaderName:string;
    private shaderSource:string;
    private shaderAmount:number;

    public constructor(name:string) {
        this.shaderName = name;
    }

    public get name() : string {
        return this.shaderName;
    }

    public get amount() : number {
        return this.shaderAmount;
    }

    public set amount(value:number) {
        this.shaderAmount = value;
    }

    public set source(value:string) {
        this.shaderSource = value;
    }

    public html() {
        return this.shaderSource;
    }

    public importToDOM() {
        const svg:HTMLElement   = document.createElement('div');
        svg.style.display       = 'none';
        svg.innerHTML           = this.shaderSource;
        svg.id                  = this.shaderName;
        document.body.appendChild(svg);
    }

}

export class SharpenShader extends Shader {

    public constructor(amount:number = 1) {
        super('sharpen');
        this.amount = amount;
        this.source = `
        <svg xmlns="http://www.w3.org/2000/svg">
            <filter id="sharpen">
                <feConvolveMatrix order="3" kernelMatrix="0 -1 0 -1 ${this.amount} -1 0 -1 0"/>
            </filter>
        </svg>
        `;
    }
}

export class BlurShader extends Shader {

    public constructor(amount:number = 1) {
        super('blur');
        this.amount = amount;
        this.source = `
        <svg xmlns="http://www.w3.org/2000/svg">
            <filter id="blur">
                <feGaussianBlur stdDeviation="${this.amount}"/>
            </filter>
        </svg>
        `;
    }
}

export class PixelateShader extends Shader {

    public constructor(amount:number = 1) {
        super('pixelate');
        this.amount = amount;
        this.source = `
        <svg xmlns="http://www.w3.org/2000/svg">
            <filter id="pixelate">
                <feMorphology operator="dilate" radius="${this.amount}"/>
            </filter>
        </svg>
        `;
    }
}

export class GrayscaleShader extends Shader {

    public constructor() {
        super('grayscale');
        this.source = `
        <svg xmlns="http://www.w3.org/2000/svg">
            <filter id="grayscale">
                <feColorMatrix type="saturate" values="0"/>
            </filter>
        </svg>
        `;
    }
}

export class VintageShader extends Shader {

    public constructor() {
        super('vintage');
        this.source = `
        <svg xmlns="http://www.w3.org/2000/svg">
            <filter id="vintage">
                <feColorMatrix type="matrix" values="0.9 0 0 0 0 0 0.9 0 0 0 0 0 0.9 0 0 0 0 0 1 0"/>
            </filter>
        </svg>
        `;
    }
}