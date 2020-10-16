
﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TRL.Common.Data.Spreads
{
    public class BuySpreadDataDictionaryFactory:IGenericFactory<IDictionary<string, double>>
    {
        private IEnumerable<string> leftLeg, rightLeg;
        private IQuoteProvider qProvider;

        public BuySpreadDataDictionaryFactory(IQuoteProvider provider,
            IEnumerable<string> leftLeg,
            IEnumerable<string> rightLeg)
        {
            this.leftLeg = leftLeg;
            this.rightLeg = rightLeg;
            this.qProvider = provider;
        }

        public IDictionary<string, double> Make()
        {
            IDictionary<string, double> result = new Dictionary<string, double>();

            FillOfferPrices(result);

            FillBidPrices(result);

            return result;
        }

        private void FillBidPrices(IDictionary<string, double> result)
        {
            int rCount = this.rightLeg.Count();

            for (int i = 0; i < rCount; i++)
            {
                double price = this.qProvider.GetBidPrice(this.rightLeg.ElementAt(i), 0);

                if (price > 0)
                    result.Add(this.rightLeg.ElementAt(i), price);
            }
        }

        private void FillOfferPrices(IDictionary<string, double> result)
        {
            int lCount = this.leftLeg.Count();

            for (int i = 0; i < lCount; i++)
            {
                double price = this.qProvider.GetOfferPrice(this.leftLeg.ElementAt(i), 0);

                if (price > 0)
                    result.Add(this.leftLeg.ElementAt(i), price);
            }
        }
    }
}