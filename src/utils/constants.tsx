// //Roles

// // SUPER_ADMIN
// //Create other roles (admin/bar services)
// //all previleges
// // export lawyer/payment data

// // ADMIN
// //view/add/edit/suspend lawyer
// //view/add/edit/deactivate branches
// //view all transactions
// //all payments
// //admin dashboard
// //can create only bar service
// //doc request
// // export lawyer/payment data

// // BAR_SERVICES
// //view/edit lawyer
// //view/edit branch
// //view all transaction
// //admin dashboard
// //doc request

// //PRACTICING_LAWYER
// //view my transaction
// //doc request history
// //profile
// //user dashboard

// export const ACCESS_ROLES = {
//   user_access: ["PRACTICING_LAWYER"],
//   admin_access: ["SUPER_ADMIN", "ADMIN"],
//   conference_access: [
//     "SUPER_ADMIN",
//     "ADMIN",
//     "CONFERENCE_ADMIN",
//     "BAR_SERVICES",
//     "BRANCH_ADMIN",
//     "PRACTICING_LAWYER",
//   ],
//   conference_sidebar_access: [
//     "SUPER_ADMIN",
//     "ADMIN",
//     "PRACTICING_LAWYER",
//     "CONFERENCE_ADMIN",
//     "BRANCH_ADMIN",
//     "BAR_SERVICES",
//   ],
//   user_dashboard: ["PRACTICING_LAWYER", "CONFERENCE_ADMIN", "BRANCH_ADMIN"],
//   admin_dashboard: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
//   branch: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
//   lawyer: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
//   admin_transaction: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
//   user_transaction: ["PRACTICING_LAWYER", "BRANCH_ADMIN", "BAR_SERVICES"],
//   verified_lawyer: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
//   verified_list: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
//   payment: ["PRACTICING_LAWYER", "BRANCH_ADMIN", "BAR_SERVICES"],
//   transaction: [
//     "PRACTICING_LAWYER",
//     "BRANCH_ADMIN",
//     "BAR_SERVICES",
//     "SUPER_ADMIN",
//     "ADMIN",
//     "CONFERENCE_ADMIN",
//     "BRANCH_ADMIN",
//     "BAR_SERVICES",
//   ],
//   profile: [
//     "SUPER_ADMIN",
//     "ADMIN",
//     "BAR_SERVICES",
//     "PRACTICING_LAWYER",
//     "BRANCH_ADMIN",
//   ],
//   user_management: ["SUPER_ADMIN", "ADMIN"],
//   doc_request: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
//   digital_center: ["PRACTICING_LAWYER", "BRANCH_ADMIN", "BAR_SERVICES"],
//   branch_dashboard: ["BRANCH_ADMIN"],
// };

//Roles

// SUPER_ADMIN
//Create other roles (admin/bar services)
//all previleges
// export lawyer/payment data

// ADMIN
//view/add/edit/suspend lawyer
//view/add/edit/deactivate branches
//view all transactions
//all payments
//admin dashboard
//can create only bar service
//doc request
// export lawyer/payment data

// BAR_SERVICES
//view/edit lawyer
//view/edit branch
//view all transaction
//admin dashboard
//doc request

//PRACTICING_LAWYER
//view my transaction
//doc request history
//profile
//user dashboard

export const ACCESS_ROLES = {
  user_access: ["PRACTICING_LAWYER", "BAR_SERVICES"],
  admin_access: ["SUPER_ADMIN", "ADMIN"],
  conference_access: [
    "SUPER_ADMIN",
    "ADMIN",
    "CONFERENCE_ADMIN",
    "BAR_SERVICES",
    "BRANCH_ADMIN",
    "PRACTICING_LAWYER",
  ],
  conference_sidebar_access: [
    "SUPER_ADMIN",
    "ADMIN",
    "PRACTICING_LAWYER",
    "CONFERENCE_ADMIN",
    "BRANCH_ADMIN",
    "BAR_SERVICES",
  ],
  user_dashboard: [
    "PRACTICING_LAWYER",
    "BAR_SERVICES",
    "CONFERENCE_ADMIN",
    "BRANCH_ADMIN",
  ],
  admin_dashboard: ["SUPER_ADMIN", "ADMIN"],
  branch: ["SUPER_ADMIN", "ADMIN"],
  lawyer: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
  admin_transaction: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
  user_transaction: [
    "PRACTICING_LAWYER",
    "BRANCH_ADMIN",
    "BAR_SERVICES",
    "SUPER_ADMIN",
    "ADMIN",
    "CONFERENCE_ADMIN",
  ],
  verified_lawyer: ["SUPER_ADMIN", "ADMIN"],
  verified_list: ["SUPER_ADMIN", "ADMIN"],
  payment: ["PRACTICING_LAWYER", "BAR_SERVICES", "SUPER_ADMIN", "ADMIN"],
  transaction: [
    "BAR_SERVICES",
    "PRACTICING_LAWYER",
    "SUPER_ADMIN",
    "ADMIN",
    "CONFERENCE_ADMIN",
  ],
  profile: [
    "SUPER_ADMIN",
    "ADMIN",
    "BAR_SERVICES",
    "PRACTICING_LAWYER",
    "BRANCH_ADMIN",
  ],
  user_management: ["SUPER_ADMIN", "ADMIN"],
  doc_request: ["SUPER_ADMIN", "ADMIN", "BAR_SERVICES"],
  digital_center: [
    "BAR_SERVICES",
    "PRACTICING_LAWYER",
    "SUPER_ADMIN",
    "ADMIN",
    "CONFERENCE_ADMIN",
  ],
  branch_dashboard: ["BRANCH_ADMIN"],
  payment_menu: ["PRACTICING_LAWYER", "BAR_SERVICES"], // Sidebar menu visibility only
};
