import React from 'react';
import { Trash2 } from 'lucide-react';
import './TransactionTable.css';

export const TransactionTable = ({ currentMonthExpenses, getBadgeClass, handleDeleteExpense }) => {
  return (
    <div className="table-container tx-table-container">
      {currentMonthExpenses.length === 0 ? (
        <div className="tx-table-empty">
          No transactions found for this month. Try writing an AI command or uploading a receipt!
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentMonthExpenses.map((exp) => (
              <tr key={exp.id}>
                <td className="tx-table-date">{exp.date}</td>
                <td className="tx-table-desc">{exp.description}</td>
                <td>
                  <span className={getBadgeClass(exp.category)}>{exp.category.split(' ')[0]}</span>
                </td>
                <td className="tx-table-amount">₹{exp.amount.toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="tx-table-delete-btn"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
