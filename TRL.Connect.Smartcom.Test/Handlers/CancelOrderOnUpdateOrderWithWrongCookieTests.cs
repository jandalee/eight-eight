using System;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Connect.Smartcom.Data;
using TRL.Common.Models;
using TRL.Emulation;
using TRL.Common.Extensions;
using System.Collections.Generic;
using TRL.Common.TimeHelpers;
using TRL.Connect.Smartcom.Models;
using SmartCOM3Lib;
using TRL.Connect.Smartcom.Handlers;
using TRL.Logging;
using TRL.Common;

namespace TRL.Connect.Smartcom.Test.Handlers
{
    [TestClass]
    public class CancelOrderOnUpdateOrderWithWrongCookieTests
    {
        private IDataContext tradingData;
        private RawTradingDataContext rawData;
        private StrategyHeader strategyHeader;
        private Signal signal;
        private Order order;
        private string orderNo;
        private DateTime cancellationDate;

        [TestInitialize]
        public void Setup()
        {
            this.tradingData = new TradingDataContext();
            this.rawData = new RawTradingDataContext();

            this.strategyHeader = new StrategyHeader(1, "Strategy", "BP12345-RF-01", "RTS-9.14_FT", 5);
            this.tradingData.Get<ICollection<StrategyHeader>>().Add(this.strategyHeader);

            this.signal = new Signal(this.strategyHeader, BrokerDateTime.Make(DateTime.Now), TradeAction.Buy, OrderType.Stop, 0, 125000, 0);
            this.order = this.tradingData.AddSignalAndItsOrder(this.signal);

            this.orderNo = "8899000";
            this.cancellationDate = BrokerDateTime.Make(DateTime.Now);
            this.rawData.GetData<CookieToOrderNoAssociation>().Add(new CookieToOrderNoAssociation(this.order.Id, this.orderNo));

            CancelOrderOnUpdateOrderWithWrongCookie handler =
                new CancelOrderOnUpdateOrderWithWrongCookie(this.tradingData, this.rawData, new NullLogger());

            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Signal>>().Count());
            Assert.AreEqual(1, this.tradingData.Get<IEnumerable<Order>>().Count());
            Assert.AreEqual(1, this.rawData.GetData<CookieToOrderNoAssociation>().Count); 
            Assert.AreEqual(0, this.rawData.GetData<UpdateOrder>().Count);
            Assert.IsFalse(this.order.IsCanceled);
        }

        [TestMethod]
        public void cancel_partially_filled_order_on_state_cancel_test()
        {
            UpdateOrder update =
                new UpdateOrder(this.order.Portfolio,
                    this.order.Symbol,
                    StOrder_State.StOrder_State_Cancel,
                    StOrder_Action.StOrder_Action_Buy,
                    StOrder_Type.