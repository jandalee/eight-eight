
﻿using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Extensions.Data;
using TRL.Common.Collections;
using TRL.Common.Models;
using System.Collections.Generic;
//using TRL.Common.Extensions;
using TRL.Emulation;
using TRL.Common;
using TRL.Logging;

namespace TRx.Handlers.Test
{
    [TestClass]
    public class StopLossOnBarTests
    {
        private IDataContext tradingData;
        private ObservableQueue<Signal> signalQueue;

        private StrategyHeader strategyHeader;
        private BarSettings barSettings;
        private double points;

        [TestInitialize]
        public void Setup()
        {
            this.tradingData = new TradingDataContext();
            this.signalQueue = new ObservableQueue<Signal>();

            this.strategyHeader = new StrategyHeader(1, "Description", "BP12345-RF-01", "RTS-3.14_FT", 10);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(this.strategyHeader);

            this.barSettings = new BarSettings(this.strategyHeader, this.strategyHeader.Symbol, 60, 3);
            this.tradingData.Get<ICollection<BarSettings>>().Add(this.barSettings);

            this.points = 100;

            Assert.IsFalse(this.tradingData.PositionExists(this.strategyHeader));
            Assert.AreEqual(0, this.signalQueue.Count);
        }
