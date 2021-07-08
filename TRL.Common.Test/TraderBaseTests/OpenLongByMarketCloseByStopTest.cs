using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TRL.Common.Data;
using TRL.Common.Collections;
using TRL.Common.Models;
using TRL.Common.Test.Mocks;
using TRL.Common.TimeHelpers;
using TRL.Emulation;
using TRL.Handlers.StopLoss;
using TRL.Handlers.TakeProfit;
using TRL.Logging;
using TRL.Common.Handlers;

namespace TRL.Common.Test.TraderBaseTests
{
    [TestClass]
    public class OpenLongByMarketCloseByStopTest
    {
        private IDataContext tradingData;
        private ObservableQueue<Signal> signalQueue;
        private ObservableQueue<Order> o