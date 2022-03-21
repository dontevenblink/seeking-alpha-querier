export class Options {
	method: string;
	url: string;
	params: object;
	headers: object;

	constructor(arrayOfTickers: Array<string>) {
		(this.method = 'GET'),
			(this.url = 'https://seeking-alpha.p.rapidapi.com/symbols/get-valuation'),
			(this.params = { symbols: arrayOfTickers.toString() }),
			(this.headers = {
				'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
				'x-rapidapi-key': process.env.SA_KEY,
			});
	}
}
