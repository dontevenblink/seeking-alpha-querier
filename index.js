const dotenv = require('dotenv').config();
const spacetime = require('spacetime');
const axios = require('axios').default;
const { GoogleSpreadsheet } = require('google-spreadsheet');

const tickers = ['aapl', 'tsla', 'store'].map((e) => e.toUpperCase());

const options = {
	method: 'GET',
	url: 'https://seeking-alpha.p.rapidapi.com/symbols/get-valuation',
	params: { symbols: tickers.toString() },
	headers: {
		'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
		'x-rapidapi-key': process.env.SA_KEY,
	},
};
console.log(`tickers array string: ${tickers.toString()}`);

const doc = new GoogleSpreadsheet(`${process.env.SHEET_ID}`);

(async function () {
	try {
		await doc.useServiceAccountAuth({
			client_email: process.env.CLIENT_EMAIL,
			private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
		});

		await doc.loadInfo();
	} catch (error) {
		console.log(`error: ${error}`);
	}
})().then(() => main());

async function main() {
	console.log(doc.title);

	const sheet = doc.sheetsByIndex[0];
	console.log(sheet.title);

	axios
		.request(options)
		.then(async function (response) {
			console.log(response.data.data);
			await asyncForEach(response.data.data, async (element) => {
				console.log(element.attributes.pegNongaapFy1);
				const newRow = await sheet.addRow({
					ticker: element.id,
					pegFWD: element.attributes.pegNongaapFy1,
					pegTTM: element.attributes.pegRatio,
					date: spacetime.now('America/New_York').format('{month-pad}/{day-pad}/{year}'),
				});
			});
		})
		.catch((error) => {
			console.error(error);
		});
}

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
