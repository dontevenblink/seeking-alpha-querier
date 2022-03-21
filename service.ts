import type { AxiosResponse, ResponseType } from 'axios';
import type { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import type { seekingAlphaResponse } from './interfaces';
import { Options } from './Options';
import { tickers } from './tickers';

const dotenv = require('dotenv');
if (process.env.RUN_ENV !== 'production') {
	dotenv.config();
	console.log('environment is development, using dotenv...');
}
const spacetime = require('spacetime');
const axios = require('axios').default;
const { GoogleSpreadsheet } = require('google-spreadsheet');

let collector: Array<string> = [];

const doc = new GoogleSpreadsheet(`${process.env.SHEET_ID}`);
let sheet: GoogleSpreadsheetWorksheet;

main();

// functions

async function main() {
	try {
		await doc.useServiceAccountAuth({
			client_email: process.env.CLIENT_EMAIL,
			private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
		});
		await doc.loadInfo();
		sheet = doc.sheetsByIndex[0];
		await asyncForEach(tickers, loopableRequest);
	} catch (error) {
		console.log(`error: ${error}`);
	}
}

async function loopableRequest(e: string) {
	if (collector.length < 4) collector.push(e);

	if (collector.length === 4 || e === tickers[tickers.length - 1]) {
		let options = new Options(collector);
		await requestAndPost(options);
		console.log('resetting collector...');
		collector = [];
	}
}

async function asyncForEach(array: any, callback: any) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

async function requestAndPost(options: Options) {
	console.log(`requesting data on these tickers: ${collector}...`);
	let response = await axios.request(options);
	await loopPost(response);
}

async function loopPost(response: AxiosResponse) {
	// console.log(response.data.data);
	await asyncForEach(response.data.data, postToSheet);
}

async function postToSheet(element: seekingAlphaResponse) {
	console.log('posting to sheet...');
	const newRow = await sheet.addRow({
		ticker: element.id,
		pegFWD: element.attributes.pegNongaapFy1,
		pegTTM: element.attributes.pegRatio,
		date: spacetime.now('America/New_York').format('{iso-month}/{date-pad}/{year}'),
	});
	// console.log('postToSheetComplete');
}
