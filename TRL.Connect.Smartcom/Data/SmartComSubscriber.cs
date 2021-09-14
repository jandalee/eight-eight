using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common.Data;
using SmartCOM3Lib;
using TRL.Configuration;
using TRL.Common.Events;
using TRL.Logging;
using TRL.Common;
using TRL.Common.TimeHelpers;

namespace TRL.Connect.Smartcom.Data
{
    public class SmartComSubscriber:ISubscriber
    {
        private int subscriptionsCounter;
        private StServer stServer;
        private ILogger logger;

        public HashSet<string> Ticks;
        public HashSet<string> Portfolios;
        public HashSet<string> BidsAndAsks;
        public HashSet<string> Quotes;

        public SmartComSubscriber() :
            this(new StServerSingleton().Instance, DefaultLogger.Instance) { }

        public SmartComSubscriber(StServer stS