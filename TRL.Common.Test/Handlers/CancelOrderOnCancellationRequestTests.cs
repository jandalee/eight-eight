using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Models;
using TRL.Common.Test.Mocks;
using TRL.Common.TimeHelpers;
using TRL.Common.Handlers;
using TRL.Common.Collections;
using TRL.Emulation;
using TRL.Logging;

namespace TRL.Common.Handlers.Test
{
    [TestClass]
    public class CancelOrderOnCancellationRequestTests
    {
        private IDataContext tradingData;
        private StrategyHeader st1, st2, st3;
        private Signal s1, s2, s3;
        private MockOrderManager manager;

        [TestInitialize]
        public void Handlers_Setup()
        {
            this.tradingData = new TradingDataContext();
            this.manager = new MockOrderManager();
            CancelOrderOnCancellationRequest handler = new CancelOrderOnCancellationRequest(this.manager, this.tradingData, new NullLogger());

            AddStrategies();

            AddSignals();

        }

        private void AddSignals()
        {
            this.s1 = new Signal(this.st1, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Market, 130000, 0, 0);
            this.s2 = new Signal(this.st2, BrokerDateTime.Mak