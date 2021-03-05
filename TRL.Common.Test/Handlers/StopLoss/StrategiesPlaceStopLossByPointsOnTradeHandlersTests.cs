using System;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Models;
using System.Collections.Generic;
using TRL.Common.Handlers;
using TRL.Common.Collections;
using TRL.Handlers.StopLoss;
using TRL.Logging;

namespace TRL.Common.Handlers.Test.StopLoss
{
    [TestClass]
    public class StrategiesPlaceStopLossByPointsOnTradeHandlersTests
    {
        private IDataContext tradingData;
        private ObservableQueue<Signal> signalQueue;
        private int strategiesCounter, stopPointsSettingsCounter, stopLossOrderSettingsCounter;

        private StrategiesPlaceStopLossByPointsOnTradeHandlers handlers;

        [TestInitialize]
        public void Setup()
        {
            this.tradingData = new TradingDataContext();
            this.signalQueue = new ObservableQueue<Signal>();
            this.strategiesCounter = 5;
            this.stopPointsSettingsCounter = 4;
            this.stopLossOrderSettingsCounter = 3;

            MakeAndAddStrategiesToTradingDataContext(this.strategiesCounter);
            Assert.AreEqual(this.strategiesCounter, this.tradingData.Get<IEnumerable<StrategyHeader>>().Count());

            MakeAndAddStopPointsSettingsToTradingDataContext(this.stopPointsSettingsCounter);
            Assert.AreEqual(this.stopPointsSettingsCounter, this.tradingData.Get<IEnumerable<StopPointsSettings>>().Count());

            MakeAndAddStopLossOrderSettingsToTradingDataContext(this.stopLossOrderSettingsCounter);
            Assert.AreEqual(this.stopLossOrderSettingsCounter, this.tradingData.Get<IEnumerable<StopLossOrderSettings>>().Count());

            this.handlers = 
                new StrategiesPlaceStopLossByPointsOnTradeHandlers(this.tradingData, this.signalQueue, new NullLogger());
        }

        private void