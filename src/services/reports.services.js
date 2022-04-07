/*!
 * Reports services/utilities (Vue)
 * File: forms.services.js
 * Copyright(c) 2022 BC Gov
 * MIT Licensed
 */

const reportsList = [
    {
      id: 'lsa-awards-summary',
      ref: 'lsa-report-1',
      category: 'awards',
      slug: 'summary',
      label: 'Awards: List and Totals',
      description: 'List of available awards and their order totals',
      authorize: 'admin',
      schema: {
        fields: [
          {key: 'name', label: 'Award'},
          {key: '25', label: '25'},
          {key: '30', label: '30'},
          {key: '35', label: '35'},
          {key: '40', label: '40'},
          {key: '45', label: '45'},
          {key: '50', label: '50'},
          {key: 'extras', label: 'Extras'},
        ]
      }
    },
    // {
    //   id: 'lsa-awards-watches',
    //   ref: 'lsa-report-2',
    //   category: 'awards',
    //   label: 'Awards: Watches',
    //   description: 'Summary of all combinations of watch options and their order count',
    //   url: 'reports/lsa-awards-watches',
    //   authorize: 'admin'
    // }
  ];

const reportCategories = [
  'awards',
  'ceremony'
];

export default {

  /**
   * list all reports
   * **/

  reports: function reports() {
    return reportsList;
  },

  /**
   * lookup report by key
   * **/

  get: function get(key) {
    const found = reportsList.filter(item => item.id === key);
    return found.length > 0 ? found[0] : null;
  },

  /**
   * lookup report by key
   * **/

  categories: function categories() {
    return reportCategories;
  }

}
