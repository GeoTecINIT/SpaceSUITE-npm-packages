class DeprecatedConcept {
    code: string;
    name: string;
    color: string;
    version: string;

    constructor(data?: any) {
      if (data) {
        this.code = data.code;
        this.name = data.name;
        this.color = data.color;
        this.version = data.version;
      }
      else {
        this.code = '';
        this.name = '';
        this.color = '';
        this.version = '';
      }
    }

    toFirestore() {
    return {
      code: this.code,
      name: this.name,
      color: this.color,
      version: this.version
    };
  }
}