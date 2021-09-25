using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SmartCOM3Lib;
using TRL.Connector;
using TRL.Message;
using TRL.Connect.Smartcom.Events;
using TRL.Connect.Smartcom.Data;
using TRL.Common.TimeHelpers;
using TRL.Configuration;
using TRL.Common.Events;
using TRL.Common.Data;
using TRL.Logging;
using TRL.Common;

namespace TRL.Connect.Smartcom
{
    public class SmartComConnector:IConnector
    {
        private SmartComHandlersDatabase handlers;
        private StServer stServer;
        private ILogger logger;
        private ConnectionCredentials cc;


        public SmartComConnector() : this(new StServerSingleton().Instance, SmartComHandlers.Instance, DefaultLogger.Instance) { }

        public SmartComConnector(StServer stServer, SmartComHandlersDatabase handlers, ILogger logger)
        {
            this.stServer = stServer;
            this.handlers = handlers;
            this.logger = logger;

            this.cc = new ConnectionCredentials();

            this.handlers.Add<_IStClient_ConnectedEventHandler>(ConnectionSucceed);
            this.handlers.Add<_IStClient_DisconnectedEventHandler>(ConnectorDisconnected);
        }

        public void Connect()
        {
            this.logger.Log(String.Format("{0:dd/MM/yyyy H:mm:ss.fff}, {1}, выполняется подключение", 
                BrokerDateTime.Make(DateTime.Now),
                this.GetType().Name));

            this.stServer.connect(this.cc.Host, (ushort)this.cc.Port, this.cc.Login, this.cc.Password);
        }

        public void Disconnect()
        {
            this.logger.Log(String.Format("{0:dd/MM/yyyy H:mm:ss.fff}, {1}, выполняется отключение", 
                BrokerDateTime.Make(DateTime.Now),
                this.GetType().Name));
            try 
            {
                this.stServer.disconnect();
            }
            catch
            {
                this.lo