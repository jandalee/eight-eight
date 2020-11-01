using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common.Events;
using TRL.Common.Data;
using TRL.Common.Extensions.Data;
using TRL.Common.Models;
using TRL.Common.Collections;
using TRL.Logging;
//using TRL.Common.Extensions;

namespace TRL.Common.Handlers
{
    public class SendItemOnOrder:IObserver
    {
        //private IDataContext tradingData;
        private ObservableQueue<Order> orderQueue;
        //private IOrderManager manager;
        //private ILogger logger;

        //public OrderQueueProcessor(IOrderManager manager, IDataContext tradingData, ObservableQueue<Order> orderQueue, ILogger logger)
        //{
        //    this.manager = manager;
        //    this.tradingData = tradingData;
        //    this.orderQueue = orderQueue;
        //    this.logger = logger;

        //    this.orderQueue.RegisterObserver(this);
        //}

        /// <summary>
        /// сторонний обработчик
        /// </summary>
        private ItemAddedNotification<Order> OrderHandler;

        public SendItemOnOrder(ObservableQueue<Order> orderQueue)
        {
            this.orderQueue = orderQueue;
            this.orderQueue.RegisterObserver(this);
        }


        public void Update()
        {
            Order order = this.orderQueue.Dequeue();
            OrderHand