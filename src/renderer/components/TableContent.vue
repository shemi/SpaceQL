<template>

    <div>
        <data-table :columns="columns"
                    :content="content">
        </data-table>
    </div>

</template>

<script>
    import DataTable from './DataTable/DataTable';

    export default {

        data() {
            return {
                columns: [
                    {name: 'test_1'},
                    {name: 'test_2'},
                    {name: 'test_3'},
                    {name: 'test_4'},
                    {name: 'test_5'},
                ],
                content: [
                    {
                        test_1: 'test 1 value',
                        test_2: 'test 2 value',
                        test_3: 'test 3 value',
                        test_4: 'test 4 value',
                        test_5: 'test 5 value',
                    }
                ]
            }
        },

        components: {
            DataTable
        }

    }

</script>