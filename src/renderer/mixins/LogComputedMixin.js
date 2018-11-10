import GeneralComputedMixin from './GeneralComputedMixin';
import {LOG_TYPE_ERROR} from "../../utils/constants";

export default {

    mixins: [GeneralComputedMixin],

    watch: {
        database() {
            this.$forceUpdate();
        }
    },

    computed: {

        log() {
            return this.tab ? this.tab.log : null;
        },

        rows() {
            let rows = this.log ? this.log.logs : [];

            if(this.filterDatabase) {
                rows = rows.filter(item => this.database.name === item.database);
            }

            return rows;
        },

        errorLogsCount() {
            return this.rows
                .filter(item => item.type === LOG_TYPE_ERROR)
                .length;
        },

        lastLog() {
            if(this.rows.length <= 0) {
                return null;
            }

            return this.rows[this.rows.length - 1];
        },

        filterDatabase: {
            get() {
                return this.log ? this.log.getState('filterDatabase') : true;
            },
            set(val) {
                if(this.log) {
                    this.log.setState('filterDatabase', val);
                }
            }
        }

    }

};