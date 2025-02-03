document.addEventListener("DOMContentLoaded", async () => {
	try {
		// Get the NLU result from storage
		let { nluResult } = await browser.storage.local.get("nluResult");


		if (!nluResult) {
			document.getElementById("nluSentiment").innerText = "No result found.";
			return;
		} else { 
			browser.storage.local.remove("nluResult");
		}

		const wsent = document.getElementById("nluSentiment")
		const wres = document.getElementById("nluEmotions")
		if (nluResult.warning) { 
			if (!nluResult.sentiment)  { 
			wsent.innerText = "Something unexpected happened";
			wsent.classList.add("error");
			wres.innerText = nluResult.warning;
			return;
			} else { 
				wres.innerText = "No emotion information : "+nluResult.warning;
				wres.classList.add("error");
			}
		}


		const myChartS = echarts.init(wsent, '', {
			renderer: 'canvas',
			        width: 600,
                    height: 300,

		});
		var optionS = {
			series: [
				{
					type: 'gauge',
					startAngle: 180,
					endAngle: 0,
					center: ['50%', '75%'],
					radius: '100%',
					min: -1,
					max: 1,
					splitNumber: 8,
					axisLine: {
						lineStyle: {
							width: 6,
							color: [
								[0.25, '#FF6E76'],
								[0.5, '#FDDD60'],
								[0.75, '#58D9F9'],
								[1, '#7CFFB2']
							]
						}
					},
					pointer: {
						icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
						length: '12%',
						width: 20,
						offsetCenter: [0, '-60%'],
						itemStyle: {
							color: 'auto'
						}
					},
					axisTick: {
						length: 12,
						lineStyle: {
							color: 'auto',
							width: 2
						}
					},
					splitLine: {
						length: 20,
						lineStyle: {
							color: 'auto',
							width: 5
						}
					},
					axisLabel: {
						color: '#464646',
						fontSize: 12,
						distance: -60,
						rotate: 'tangential',
						formatter: function (value) {
							if (value === 0.75) {
								return 'Very positive';
							} else if (value === 0.25) {
								return 'Positive';
							} else if (value === -0.25) {
								return 'Negative';
							} else if (value === -0.75) {
								return 'Very negative';
							}
							return '';
						}
					},
					title: {
						offsetCenter: [0, '-10%'],
						fontSize: 15
					},
					detail: {
						fontSize: 15,
						offsetCenter: [0, '-35%'],
						valueAnimation: true,
						formatter: function (value) {
							return Math.round(value * 100) + '';
						},
						color: 'inherit'
					},
					data: [
						{
							value: nluResult.sentiment,
							name: 'Sentiment Rating'
						}
					]
				}
			]
		};


		if (optionS && typeof optionS === 'object') {
			myChartS.setOption(optionS);
		} else {
			console.log('no object for sentiment');
		}

		if (nluResult.emotions) { 
		const categories = Object.keys(nluResult.emotions);
		const values = Object.values(nluResult.emotions).map(value => parseFloat(value) * 100);
		const myChartM = echarts.init(wres, '', {
			renderer: 'canvas',
			width: 600,
			height: 300,

		});
		var optionM = {
			title: {
				text: 'Emotion Analysis',
				left: 'center'
			},
			xAxis: {
				type: 'category',
				data: categories, // Emotion labels
				axisLabel: {
					rotate: 30 // Rotate labels for better visibility if needed
				}
			},
			yAxis: {
				type: 'value',
				axisLabel: {
					formatter: '{value}'
				}
			},
			series: [
				{
					name: 'Emotion Intensity',
					type: 'bar',
					data: values, // Scaled emotion values
					itemStyle: {
						color: '#5470C6' // Bar color
					},
					emphasis: {
						itemStyle: {
							color: '#91CC75' // Highlight color on hover
						}
					}
				}
			]
		};

		if (optionM && typeof optionM === 'object') {
			myChartM.setOption(optionM);
		} else {
			console.log('no object for emotions');
		}}

	} catch (error) {
		console.error("Error loading NLU result:", error);
	}
});

