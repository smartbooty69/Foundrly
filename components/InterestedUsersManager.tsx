'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { InterestedSubmission } from '@/sanity/types';
import { 
  Eye, 
  Mail, 
  Phone, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ChevronDown,
  Circle,
  UserCheck,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Archive
} from 'lucide-react';

interface InterestedUsersManagerProps {
  userId: string;
}

const InterestedUsersManager: React.FC<InterestedUsersManagerProps> = ({ userId }) => {
  const [submissions, setSubmissions] = useState<InterestedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<InterestedSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(false);

  // Fetch submissions on component mount
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/interested-submissions');
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.status-dropdown')) {
        setOpenDropdown(null);
      }
      if (openFilterDropdown && !(event.target as Element).closest('.filter-dropdown')) {
        setOpenFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown, openFilterDropdown]);

  // Filter and search submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesSearch = 
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.startupTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (submission.company && submission.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  // Status statistics
  const statusStats = useMemo(() => {
    const stats = {
      new: 0,
      contacted: 0,
      'in-discussion': 0,
      interested: 0,
      'not-interested': 0,
      closed: 0,
    };
    
    submissions.forEach(submission => {
      if (submission.status && stats.hasOwnProperty(submission.status)) {
        stats[submission.status as keyof typeof stats]++;
      }
    });
    
    return stats;
  }, [submissions]);

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/interested-submissions/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, status: newStatus }),
      });

      if (response.ok) {
        setSubmissions(prev => 
          prev.map(sub => 
            sub._id === submissionId 
              ? { ...sub, status: newStatus as any }
              : sub
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleNotesUpdate = async (submissionId: string, newNotes: string) => {
    try {
      const response = await fetch('/api/interested-submissions/update-notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, notes: newNotes }),
      });

      if (response.ok) {
        setSubmissions(prev => 
          prev.map(sub => 
            sub._id === submissionId 
              ? { ...sub, notes: newNotes }
              : sub
          )
        );
        setEditingNotes(false);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const response = await fetch('/api/interested-submissions/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      if (response.ok) {
        setSubmissions(prev => prev.filter(sub => sub._id !== submissionId));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Role', 'Startup', 'Investment Amount', 'Status', 'Submitted Date'].join(','),
      ...filteredSubmissions.map(sub => [
        sub.name,
        sub.email,
        sub.phone || '',
        sub.company || '',
        sub.role || '',
        sub.startupTitle,
        sub.investmentAmount || '',
        sub.status || '',
        new Date(sub.submittedAt).toLocaleDateString()
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interested-submissions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusOptions = [
    { value: 'new', label: 'New', icon: Circle, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'contacted', label: 'Contacted', icon: UserCheck, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'in-discussion', label: 'In Discussion', icon: MessageCircle, color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'interested', label: 'Interested', icon: ThumbsUp, color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'not-interested', label: 'Not Interested', icon: ThumbsDown, color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'closed', label: 'Closed', icon: Archive, color: 'bg-gray-100 text-gray-800 border-gray-200' },
  ];

  const getStatusConfig = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const getStatusColor = (status: string) => {
    return getStatusConfig(status).color;
  };

  const filterOptions = [
    { value: 'all', label: 'All Status', count: submissions.length, icon: Filter, color: 'bg-gray-100 text-gray-800 border-gray-200' },
    ...statusOptions.map(option => ({
      ...option,
      count: statusStats[option.value as keyof typeof statusStats] || 0
    }))
  ];

  const getFilterConfig = (filter: string) => {
    return filterOptions.find(option => option.value === filter) || filterOptions[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interested users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pr-20">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{statusStats.new}</div>
          <div className="text-sm text-gray-600">New</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{statusStats.contacted}</div>
          <div className="text-sm text-gray-600">Contacted</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{statusStats['in-discussion']}</div>
          <div className="text-sm text-gray-600">In Discussion</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{statusStats.interested}</div>
          <div className="text-sm text-gray-600">Interested</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{statusStats['not-interested']}</div>
          <div className="text-sm text-gray-600">Not Interested</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-600">{statusStats.closed}</div>
          <div className="text-sm text-gray-600">Closed</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, company, or startup..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80"
              />
            </div>
            <div className="relative filter-dropdown">
              <button
                onClick={() => setOpenFilterDropdown(!openFilterDropdown)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {(() => {
                  const config = getFilterConfig(statusFilter);
                  const Icon = config.icon;
                  return <Icon className="h-4 w-4" />;
                })()}
                <span className="text-sm font-medium">
                  {getFilterConfig(statusFilter).label} ({getFilterConfig(statusFilter).count})
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {openFilterDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {filterOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatusFilter(option.value);
                          setOpenFilterDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          statusFilter === option.value ? 'bg-gray-100' : ''
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{option.label}</span>
                        <span className="text-xs text-gray-500">({option.count})</span>
                        {statusFilter === option.value && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide" style={{ overflowY: 'visible' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Startup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.email}
                      </div>
                      {submission.company && (
                        <div className="text-xs text-gray-400">
                          {submission.company}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.startupTitle}
                      </div>
                      {submission.startup?.author && (
                        <div className="text-xs text-gray-500">
                          by {submission.startup.author.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {submission.investmentAmount && (
                        <div className="text-sm text-gray-900">
                          {submission.investmentAmount}
                        </div>
                      )}
                      {submission.role && (
                        <div className="text-xs text-gray-500 capitalize">
                          {submission.role.replace('-', ' ')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative status-dropdown">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === submission._id ? null : submission._id)}
                        className={`inline-flex items-center gap-2 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all duration-200 hover:shadow-sm ${getStatusColor(submission.status || 'new')}`}
                      >
                        {(() => {
                          const config = getStatusConfig(submission.status || 'new');
                          const Icon = config.icon;
                          return <Icon className="h-3 w-3" />;
                        })()}
                        {getStatusConfig(submission.status || 'new').label}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      
                      {openDropdown === submission._id && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                          {statusOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.value}
                                onClick={() => {
                                  handleStatusUpdate(submission._id, option.value);
                                  setOpenDropdown(null);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                  submission.status === option.value ? 'bg-gray-100' : ''
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{option.label}</span>
                                {submission.status === option.value && (
                                  <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setNotes(submission.notes || '');
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary/80"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <a
                        href={`mailto:${submission.email}`}
                        className="text-green-600 hover:text-green-800"
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      {submission.phone && (
                        <a
                          href={`tel:${submission.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Call"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(submission._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
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

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No interested users found</div>
            <div className="text-gray-500 text-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Users interested in your startups will appear here'
              }
            </div>
          </div>
        )}
      </div>


      {/* Detail Modal */}
      {showModal && selectedSubmission && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black max-w-4xl w-full max-h-[90vh] relative animate-fade-in overflow-hidden flex flex-col">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 z-10"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSubmission.name}</h2>
                  <p className="text-gray-600">Interested in: {selectedSubmission.startupTitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <div className="space-y-2">
                    <div><strong>Email:</strong> {selectedSubmission.email}</div>
                    {selectedSubmission.phone && <div><strong>Phone:</strong> {selectedSubmission.phone}</div>}
                    {selectedSubmission.company && <div><strong>Company:</strong> {selectedSubmission.company}</div>}
                    {selectedSubmission.role && <div><strong>Role:</strong> {selectedSubmission.role.replace('-', ' ')}</div>}
                    {selectedSubmission.location && <div><strong>Location:</strong> {selectedSubmission.location}</div>}
                  </div>
                </div>

                {/* Investment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Investment Details</h3>
                  <div className="space-y-2">
                    {selectedSubmission.investmentAmount && <div><strong>Amount:</strong> {selectedSubmission.investmentAmount}</div>}
                    {selectedSubmission.investmentType && <div><strong>Type:</strong> {selectedSubmission.investmentType.replace('-', ' ')}</div>}
                    {selectedSubmission.timeline && <div><strong>Timeline:</strong> {selectedSubmission.timeline.replace('-', ' ')}</div>}
                    <div><strong>Preferred Contact:</strong> {selectedSubmission.preferredContact}</div>
                  </div>
                </div>

                {/* Professional Links */}
                {(selectedSubmission.linkedin || selectedSubmission.website) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Professional Links</h3>
                    <div className="space-y-2">
                      {selectedSubmission.linkedin && (
                        <div>
                          <strong>LinkedIn:</strong>{' '}
                          <a href={selectedSubmission.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Profile <ExternalLink className="inline h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {selectedSubmission.website && (
                        <div>
                          <strong>Website:</strong>{' '}
                          <a href={selectedSubmission.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Visit Site <ExternalLink className="inline h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Discovery */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Discovery</h3>
                  <div className="space-y-2">
                    {selectedSubmission.howDidYouHear && <div><strong>How they heard:</strong> {selectedSubmission.howDidYouHear.replace('-', ' ')}</div>}
                    <div><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</div>
                    <div><strong>Consent:</strong> {selectedSubmission.consentToContact ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>

              {/* Experience */}
              {selectedSubmission.experience && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{selectedSubmission.experience}</p>
                </div>
              )}

              {/* Message */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Message</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{selectedSubmission.message}</p>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Internal Notes</h3>
                  <button
                    onClick={() => setEditingNotes(!editingNotes)}
                    className="text-primary hover:text-primary/80"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {editingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                      placeholder="Add internal notes about this submission..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNotesUpdate(selectedSubmission._id, notes)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Save Notes
                      </button>
                      <button
                        onClick={() => setEditingNotes(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md min-h-[100px]">
                    {selectedSubmission.notes || 'No notes added yet. Click the edit button to add notes.'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: Your interest in ${selectedSubmission.startupTitle}`}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>
                {selectedSubmission.phone && (
                  <a
                    href={`tel:${selectedSubmission.phone}`}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>,
        typeof window !== "undefined" && document.body ? document.body : document.createElement("div")
      )}
    </div>
  );
};

export default InterestedUsersManager;
