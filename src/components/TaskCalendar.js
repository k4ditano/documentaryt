import { jsx as _jsx } from "react/jsx-runtime";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
moment.locale('es');
const localizer = momentLocalizer(moment);
const TaskCalendar = ({ pages }) => {
    const events = pages.map(page => ({
        id: page.id,
        title: page.title,
        start: new Date(page.created_at || new Date()),
        end: new Date(page.updated_at || new Date()),
        allDay: true,
    }));
    const eventStyleGetter = (event) => {
        const style = {
            backgroundColor: '#3174ad',
            borderRadius: '0px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block',
        };
        return {
            style,
        };
    };
    return (_jsx("div", { style: { height: 500 }, children: _jsx(Calendar, { localizer: localizer, events: events, startAccessor: "start", endAccessor: "end", style: { height: '100%' }, eventPropGetter: eventStyleGetter, views: ['month', 'week', 'day'], messages: {
                next: 'Siguiente',
                previous: 'Anterior',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'No hay eventos en este rango',
            } }) }));
};
export default TaskCalendar;
