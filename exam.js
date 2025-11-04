import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { fetchCustomers, searchCustomers, deleteCustomer, updateCustomerStatuses } from '../store/slices/customerSlice';
import { toggleAddCustomerModal } from '../store/slices/uiSlice';
import AddCustomerModal from '../components/AddCustomerModal';
import AddPaymentModal from '../components/AddPaymentModal';
import toast from 'react-hot-toast';

const Customers = () => {
  const dispatch = useDispatch();
  const { customers, searchResults, loading, error } = useSelector(state => state.customers);
  const { showAddCustomerModal } = useSelector(state => state.ui);
  
  const searchRef = useRef(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autocompleteCustomers, setAutocompleteCustomers] = useState([]);
  const [searchedCustomer, setSearchedCustomer] = useState(null);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleUpdateStatuses = async () => {
    try {
      const result = await dispatch(updateCustomerStatuses()).unwrap();
      toast.success(`Statuses updated successfully! ${result.summary.customersUpdated} customers updated.`);
      // Refresh customers to show updated statuses
      dispatch(fetchCustomers());
    } catch (error) {
      toast.error('Failed to update customer statuses');
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter customers based on search term for autocomplete
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = customers.filter(customer => 
        customer.full_name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        customer.surname.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
      setAutocompleteCustomers(filtered);
      setShowSuggestions(true);
    } else {
      setAutocompleteCustomers([]);
      setShowSuggestions(false);
      setSearchedCustomer(null);
    }
  }, [searchTerm, customers]);

  useEffect(() => {
    if (searchTerm.trim()) {
      dispatch(searchCustomers(searchTerm));
    }
  }, [searchTerm, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(searchCustomers(searchTerm));
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (customer) => {
    setSearchedCustomer(customer);
    setSearchTerm(`${customer.surname} ${customer.full_name}`);
    setShowSuggestions(false);
    dispatch(searchCustomers(`${customer.surname} ${customer.full_name}`));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchedCustomer(null);
    setShowSuggestions(false);
    setAutocompleteCustomers([]);
    dispatch(fetchCustomers());
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await dispatch(deleteCustomer(customerId)).unwrap();
        toast.success('Customer deleted successfully');
      } catch (error) {
        toast.error(error || 'Failed to delete customer');
      }
    }
  };

  const handleAddPayment = (customer) => {
    setSelectedCustomerForPayment(customer);
    setShowAddPaymentModal(true);
  };

  const filteredCustomers = (searchResults.length > 0 ? searchResults : customers).filter(customer => {
    const typeMatch = filterType === 'all' || customer.loan_type === filterType;
    const statusMatch = filterStatus === 'all' || customer.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'loan_amount' || sortBy === 'total_paid_amount' || sortBy === 'remaining_amount') {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'overdue': return 'status-overdue';
      default: return 'status-active';
    }
  };

  const getLoanTypeColor = (type) => {
    return type === 'daily' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your loan customers and their details
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleUpdateStatuses}
            disabled={loading}
            className="btn-secondary inline-flex items-center space-x-2 px-6 py-3"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Update Statuses</span>
          </button>
          <button
            onClick={() => dispatch(toggleAddCustomerModal())}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Type first letter of customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
                className="input-field pl-10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Search
              </button>
            </form>
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && autocompleteCustomers.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {autocompleteCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {customer.surname} {customer.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {customer.id} • {customer.loan_type} • ₹{customer.loan_amount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchedCustomer && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">
                        {searchedCustomer.surname} {searchedCustomer.full_name}
                      </div>
                      <div className="text-sm text-blue-700">
                        ID: {searchedCustomer.id} • {searchedCustomer.loan_type} • ₹{searchedCustomer.loan_amount}
                      </div>
                      <div className="text-xs text-blue-600">
                        Status: {searchedCustomer.status} • Remaining: ₹{searchedCustomer.remaining_amount}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loan Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto"
          >
            <option value="created_at">Date Added</option>
            <option value="full_name">Name</option>
            <option value="loan_amount">Loan Amount</option>
            <option value="borrowed_date">Borrowed Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Customer Summary */}
      {searchedCustomer && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Customer Details for {searchedCustomer.surname} {searchedCustomer.full_name}
            </h3>
            <span className={`status-badge status-${searchedCustomer.status}`}>
              {searchedCustomer.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Loan Amount</div>
              <div className="text-xl font-semibold text-gray-900">₹{searchedCustomer.loan_amount}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">Total Paid</div>
              <div className="text-xl font-semibold text-green-700">₹{searchedCustomer.total_paid_amount}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600">Remaining</div>
              <div className="text-xl font-semibold text-orange-700">₹{searchedCustomer.remaining_amount}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">Loan Type</div>
              <div className="text-xl font-semibold text-blue-700 capitalize">{searchedCustomer.loan_type}</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Borrowed: {new Date(searchedCustomer.borrowed_date).toLocaleDateString()}</span>
              <span>Due: {new Date(searchedCustomer.due_date).toLocaleDateString()}</span>
              <span>Phone: {searchedCustomer.phone_number}</span>
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {searchResults.length > 0 ? 'Search Results' : 'All Customers'} 
            ({sortedCustomers.length})
            {searchedCustomer && (
              <span className="text-sm font-normal text-blue-600 ml-2">
                • Showing details for {searchedCustomer.surname} {searchedCustomer.full_name}
              </span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : sortedCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Loan Details</th>
                  <th className="table-header">Payment Status</th>
                  <th className="table-header">Dates</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.surname} • {customer.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoanTypeColor(customer.loan_type)}`}>
                            {customer.loan_type}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{parseInt(customer.loan_amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.loan_type === 'daily' 
                            ? `₹${customer.daily_payment_amount}/day`
                            : `₹${customer.weekly_payment_amount}/week`
                          }
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <span className={`status-badge ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                        <div className="text-xs text-gray-500">
                          Paid: ₹{parseInt(customer.total_paid_amount).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Remaining: ₹{parseInt(customer.remaining_amount).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          {new Date(customer.borrowed_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Due: {new Date(customer.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="text-primary-600 hover:text-primary-900 transition-colors duration-150"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleAddPayment(customer)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-150"
                          title="Add Payment"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-danger-600 hover:text-danger-900 transition-colors duration-150"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchResults.length > 0 
                ? 'Try adjusting your search terms or filters.'
                : 'Get started by adding your first customer.'
              }
            </p>
            {searchResults.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => dispatch(toggleAddCustomerModal())}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && <AddCustomerModal />}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <AddPaymentModal
          isOpen={showAddPaymentModal}
          onClose={() => {
            setShowAddPaymentModal(false);
            setSelectedCustomerForPayment(null);
          }}
          customerId={selectedCustomerForPayment?.id}
          customerType={selectedCustomerForPayment?.loan_type}
          customerData={selectedCustomerForPayment}
        />
      )
    </div>
  );
};

export default Customers;
