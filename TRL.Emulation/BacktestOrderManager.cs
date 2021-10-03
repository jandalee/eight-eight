using TRL.Common;
using TRL.Common.Collections;
using TRL.Common.Data;
using TRL.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TRL.Logging;
using TRL.Common.Handlers;

namespace TRL.Emulation
{
    public class BacktestOrderManager:IOrderManager
    {
        private IDataContext tradingData;
        private ILogger logger;

        public BacktestOrderManager(IDataContext tradingData, ILogger logger)
        {
            this.tradingData = tradingData;
            this.logger = logger;
        }

        public void PlaceOrder(Order order)
        {
            Bar lastBar = 
                this.tradingData.Get<IEnumerable<Bar>>().LastOrDefault(b => b.Symbol.Equals(order.Symbol));

            if (lastBar == null)
                return;

            Trade trade =
                new Trade(order,
                    order.Portfolio,
                    order.Symbol,
                    lastBar.Close,
                    order.TradeAction == TradeAction.Buy? order.Amount:-order.Amount,
      