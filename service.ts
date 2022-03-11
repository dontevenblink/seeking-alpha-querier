const dotenv = require('dotenv');
if (process.env.RUN_ENV !== 'production') {
	dotenv.config();
	console.log('environment is development, using dotenv...');
}
const spacetime = require('spacetime');
const axios = require('axios').default;
const { GoogleSpreadsheet } = require('google-spreadsheet');

const tickers: Array<string> = [
	'nflx',
	'tsm',
	'vwagy',
	'brk.b',
	'poahy',
	'rivn',
	'aapl',
	'tsla',
	'stor',
	'o',
	'AMD',
	'nvda',
	'RKLB',
	'goog',
	'amzn',
	'grwg',
	'low',
].map((e) => e.toUpperCase());

class Options {
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

let collector: Array<string>;

const doc = new GoogleSpreadsheet(`${process.env.SHEET_ID}`);

(async function () {
	try {
		await doc.useServiceAccountAuth({
			client_email: process.env.CLIENT_EMAIL,
			private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
		});
		await doc.loadInfo();
		main();
	} catch (error) {
		console.log(`error: ${error}`);
	}
})();

function main() {
	const sheet = doc.sheetsByIndex[0];
	console.log(`sheet title: ${sheet.title}`);

	asyncForEach(tickers, async function (e: string) {
		if (collector.length < 4) collector.push(e);

		if (collector.length === 4 || e === tickers[tickers.length - 1]) {
			console.log(`about to request these tickers: ${collector}`);
			let options = new Options(collector);
			await request(options, sheet);
			console.log('resetting collector...');
			collector = [];
		}
	});
}

async function asyncForEach(array: any, callback: any) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

async function request(options: Options, sheet: any) {
	await axios
		.request(options)
		.then(async function (response: any) {
			// console.log(response.data.data);
			await asyncForEach(response.data.data, async (element: any) => {
				// console.log(element.attributes.pegNongaapFy1);
				const newRow = await sheet.addRow({
					ticker: element.id,
					pegFWD: element.attributes.pegNongaapFy1,
					pegTTM: element.attributes.pegRatio,
					date: spacetime.now('America/New_York').format('{iso-month}/{date-pad}/{year}'),
				});
				console.log('postToSheetComplete');
			});
		})
		.catch((error: Error) => {
			console.error(error);
		});
}
