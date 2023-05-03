using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TRL.Common;
using TRL.Common.Collections;
using TRL.Common.Extensions.Collections;
using TRL.Common.Data;
using TRL.Common.Extensions.Data;
using TRL.Common.Handlers;
using TRL.Common.Models;
using TRL.Logging;
using TRL.Common.TimeHelpers;
using TRL.Common.Events;
using TRx.Indicators;
using TRx.Helpers;

namespace TRx.Handlers
{
    public partial class ReversMaDeOnBar//:AddedItemHandler<Bar>
    {
        /*
        public override void OnItemAdded(Bar item)
        {
        }*/
        /// <summary>
        /// здесь проверяем пересечение отклонением уровней
        /// </summary>
        /// <param name="item"></param>
        public void OnValueItemAdded(ValueDouble item)
        {
            //уровень текщий
            //уровень предыдущий
            // -------------------------------------------------
            #region //пересечение уровней
            // -------------------------------------------------
            Levels.Do(maDeviation.De);
            //IList<bool> ПересеченияСверху = levels.ПересеченияСверху;
            //IList<bool> ПересеченияСнизу = levels.ПересеченияСнизу;

            ПересечениeСверху.Add(Levels.ПересечениеСверху);
            ПересечениеСнизу.Add(Levels.ПересечениеСнизу);

            Уровень.Add(Levels.УровеньТекущий);                     //уровень текщий
            УровеньПрошлый.Add(Levels.УровеньПрошлый);              //уровень предыдущий
            #endregion
            // -------------------------------------------------

            ПроверитьПризнакНаОткрытиеВерхний();
            ПроверитьПризнакНаОткрытиеНижний();

            ПроверитьПризнакНаЗакрытиеВерхний();
            ПроверитьПризнакНаЗакрытиеНижний();

            // -------------------------------------------------
            #region // Проверка сигналов по времени
            // -------------------------------------------------

            #endregion
            // -------------------------------------------------

            // -------------------------------------------------
            #region // Подача заявок
            // -------------------------------------------------
            /// Сформировать Сигналы на открытие закрытие позиций
            СформироватьСигналы();
            #endregion
            // -------------------------------------------------
        }
        /// <summary>
        /// Сформировать Сигналы на открытие закрытие позиций
        /// </summary>
        private void СформироватьСигналы()
        {
            //throw new NotImplementedException();
            //TODO 8. вопрос - как найти количество активных позиций

            double Price = maDeviation.bar.Close;
            int i = Уровень.Count - 1;
            int MaxLevelPositionCount = 1;
            int ActivePositionCount = 0;
            ActivePositionCount = LevelStack[Уровень[i]].Count;
            // выполнение сигналов для короткой позиции
            if (ОткрытиеВерхний[i])
            {
                Signal signalSell;
                // Если нет активной короткой позиции
                // выдаем ордера на открыте новой короткой позиции.
                //if (ActivePositionCount < 