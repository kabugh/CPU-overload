export class Strategy {
    public averageLoad: number;
    public averageBias: number;
    public queries: number;
    public migrations: number;

    constructor() {
        this.averageLoad = 0;
        this.averageBias = 0;
        this.queries = 0;
        this.migrations = 0;
    }

    public get getAverageLoad(): number {
        return this.averageLoad;
    }

    public get getAverageBias(): number {
        return this.averageBias;
    }

    public get getQueries(): number {
        return this.queries;
    }

    public get getMigrations(): number {
        return this.migrations;
    }
}