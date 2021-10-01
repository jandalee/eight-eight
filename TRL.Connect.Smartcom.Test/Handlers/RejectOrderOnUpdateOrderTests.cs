using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Connect.Smartcom.Data;
using TRL.Common.Data;
using TRL.Configuration;
using TRL.Common.Models;
using TRL.Connect.Smartcom.Models;
using TRL.Connect.Smartcom.Handlers;
using TRL.Common.TimeHelpers;
using TRL.Emulation;
using SmartCOM3Lib;
using TRL.Logging;
using TRL.Common;

namespace TRL.Connect.Smartcom.Test.Handlers
{
    [TestClass]
    public class RejectOrderOnUpdateOrderTests
    {
        private RawTradingDataContext rawData;
        private IDataContext tradingData;
        private StrategyHeader strategyHeader;
        private Signal signal;
        private DateTime rejectedDate;

        [TestInitialize]
        public void Setup()
        {
            this.rawData = new RawTradingDataContext();
            this.tradingData = new TradingDataContext();

            RejectOrderOnUpdateOrder handler =
                new RejectOrderOnUpdateOrder(this.tradingData, this.rawData, new NullLogger());

            this.strategyHeader = new StrategyHeader(1, "01", "BP12345-RF-01", "RTS-9.13_FT", 10);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(this.strategyHeader);

            this.signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Limit, 130000, 0, 129900);
            this.rejectedDate = BrokerDateTime.Make(DateTime.Now);

            Assert.AreEqual(0, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(0, this.tradingData.Get<IEnumerable<Order>>().Count());
            Assert.AreEqual(0, this.rawData.GetData<UpdateOrder>().Count);
        }

        [TestMethod]
        public void reject_Order_on_ContragentReject_test()
        {
            Order order = this.tradingData.AddSignalAndItsOrder(this.signal);

            UpdateOrder update = 
                new UpdateOrder(order.Portfolio, 
                    order.Symbol, 
                    StOrder_State.StOrder_State_ContragentReject, 
                    StOrder_Action.StOrder_Action_Buy, 
                    StOrder_Type.StOrder_Type_Limit, 
                    