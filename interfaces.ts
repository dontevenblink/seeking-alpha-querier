export interface seekingAlphaResponse {
	id: string;
	type: string;
	[key: string]: any;
	attributes: {
		marketCap: number;
		totalEnterprise: number;
		lastClosePriceEarningsRatio: number;
		priceCf: number;
		priceSales: number;
		priceBook: number;
		priceTangb: number;
		evEbitda: number;
		evSales: number;
		evFcf: number;
		cShare: number;
		peRatioFwd: number;
		pegRatio: number;
		pegNongaapFy1: number;
		peGaapFy1: number;
		peNongaapFy1: number;
		peNongaap: number;
		evEbitdaFy1: number;
		evSalesFy1: number;
		[key: string]: any;
	};
}
