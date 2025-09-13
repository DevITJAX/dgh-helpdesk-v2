import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search,
  Book,
  Article,
  Computer,
  NetworkCheck,
  Security,
  Print,
  Email
} from '@mui/icons-material';
import PageLayout from '../../components/common/PageLayout';

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Mock knowledge base data - in a real app, this would come from an API
  const knowledgeArticles = [
    {
      id: 1,
      title: 'How to Reset Your Password',
      category: 'ACCESS',
      content: 'To reset your password, contact your department administrator or the IT department directly. For security reasons, password resets must be processed by an authorized administrator. Provide your employee ID and department when making the request.',
      tags: ['password', 'login', 'security'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      title: 'Connecting to Office WiFi',
      category: 'NETWORK',
      content: 'To connect to the office WiFi, select "DGH-Office" from your WiFi settings. Use your employee credentials to authenticate. If you have trouble connecting, try forgetting the network and reconnecting.',
      tags: ['wifi', 'network', 'connection'],
      lastUpdated: '2024-01-14'
    },
    {
      id: 3,
      title: 'Installing Approved Software',
      category: 'SOFTWARE',
      content: 'To install approved software, contact the IT department with your request. Only software from the approved list can be installed. Include the business justification for your request.',
      tags: ['software', 'installation', 'approval'],
      lastUpdated: '2024-01-13'
    },
    {
      id: 4,
      title: 'VPN Access Setup',
      category: 'NETWORK',
      content: 'To set up VPN access, download the VPN client from the IT portal and configure it with your credentials. This allows you to access office resources from home or while traveling.',
      tags: ['vpn', 'remote', 'access'],
      lastUpdated: '2024-01-12'
    },
    {
      id: 5,
      title: 'Printer Troubleshooting',
      category: 'HARDWARE',
      content: 'If your printer is not working, check the power connection, network connection, and ensure it has paper and ink. Try restarting the printer and your computer. Contact IT if the issue persists.',
      tags: ['printer', 'hardware', 'troubleshooting'],
      lastUpdated: '2024-01-11'
    },
    {
      id: 6,
      title: 'Email Configuration',
      category: 'COMMUNICATION',
      content: 'To configure your email, use the provided email client settings. Contact IT if you need assistance with setup. Your email address follows the format: firstname.lastname@dgh.gov.ma',
      tags: ['email', 'configuration', 'communication'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 7,
      title: 'How to Submit a Help Desk Ticket',
      category: 'ACCESS',
      content: 'To submit a help desk ticket, log into the system and click "Submit New Request". Provide a clear description of your issue, include any error messages, and specify the urgency level. You can track your ticket status online.',
      tags: ['ticket', 'helpdesk', 'support'],
      lastUpdated: '2024-01-09'
    },
    {
      id: 8,
      title: 'Working from Home Setup',
      category: 'NETWORK',
      content: 'To work from home, ensure you have a stable internet connection, set up VPN access, and have the necessary software installed. Test your connection before your first remote work day.',
      tags: ['remote', 'work', 'home', 'setup'],
      lastUpdated: '2024-01-08'
    },
    {
      id: 9,
      title: 'Microsoft Office Tips and Tricks',
      category: 'PRODUCTIVITY',
      content: 'Learn keyboard shortcuts, use templates for common documents, and utilize collaboration features in Office 365. Save files to OneDrive for automatic backup and easy sharing.',
      tags: ['office', 'microsoft', 'productivity'],
      lastUpdated: '2024-01-07'
    },
    {
      id: 10,
      title: 'Backing Up Your Work',
      category: 'PRODUCTIVITY',
      content: 'Always save your work frequently and use OneDrive for automatic backup. For important documents, create additional backups on approved storage devices. Never store sensitive data on personal devices.',
      tags: ['backup', 'data', 'security'],
      lastUpdated: '2024-01-06'
    },
    {
      id: 11,
      title: 'Meeting Room Technology',
      category: 'HARDWARE',
      content: 'To use meeting room technology, connect your laptop using the provided cables or wireless display. Test your presentation before the meeting. Contact IT if equipment is not working properly.',
      tags: ['meeting', 'presentation', 'hardware'],
      lastUpdated: '2024-01-05'
    },
    {
      id: 12,
      title: 'Phone System Guide',
      category: 'COMMUNICATION',
      content: 'Learn how to transfer calls, set up voicemail, and use conference calling features. Your extension number is listed in the employee directory. Contact IT for phone system training.',
      tags: ['phone', 'voicemail', 'conference'],
      lastUpdated: '2024-01-04'
    },
    {
      id: 13,
      title: 'Internet Speed Issues',
      category: 'NETWORK',
      content: 'If you experience slow internet, try closing unnecessary browser tabs, restart your computer, or move closer to the WiFi router. Contact IT if the issue affects your productivity.',
      tags: ['internet', 'speed', 'performance'],
      lastUpdated: '2024-01-03'
    },
    {
      id: 14,
      title: 'Computer Maintenance Best Practices',
      category: 'HARDWARE',
      content: 'Restart your computer regularly, keep software updated, and avoid downloading unauthorized files. Report any hardware issues immediately to prevent data loss.',
      tags: ['maintenance', 'computer', 'hardware'],
      lastUpdated: '2024-01-02'
    },
    {
      id: 15,
      title: 'File Sharing and Collaboration',
      category: 'PRODUCTIVITY',
      content: 'Use SharePoint for team collaboration and OneDrive for personal file storage. Set appropriate permissions when sharing files and always use version control for important documents.',
      tags: ['sharing', 'collaboration', 'files'],
      lastUpdated: '2024-01-01'
    },
    {
      id: 16,
      title: 'Mobile Device Security',
      category: 'ACCESS',
      content: 'If you use your mobile device for work, ensure it has a strong password, enable encryption, and install security updates regularly. Never store sensitive data on personal devices.',
      tags: ['mobile', 'security', 'device'],
      lastUpdated: '2023-12-31'
    },
    {
      id: 17,
      title: 'Calendar and Scheduling',
      category: 'PRODUCTIVITY',
      content: 'Use Outlook calendar for scheduling meetings and managing your time. Set up automatic reminders and share your availability with colleagues. Block time for important tasks.',
      tags: ['calendar', 'scheduling', 'outlook'],
      lastUpdated: '2023-12-30'
    },
    {
      id: 18,
      title: 'Data Protection Guidelines',
      category: 'ACCESS',
      content: 'Never share passwords, lock your computer when leaving your desk, and be careful with sensitive information. Report any security concerns immediately to IT.',
      tags: ['security', 'data', 'protection'],
      lastUpdated: '2023-12-29'
    },
    {
      id: 19,
      title: 'Software Update Procedures',
      category: 'SOFTWARE',
      content: 'Install software updates when prompted, especially security updates. Updates are scheduled during off-hours to minimize disruption. Contact IT if you have concerns about updates.',
      tags: ['updates', 'software', 'security'],
      lastUpdated: '2023-12-28'
    },
    {
      id: 20,
      title: 'Emergency IT Contact Information',
      category: 'ACCESS',
      content: 'For urgent IT issues during business hours, call the IT helpdesk at extension 1234. For after-hours emergencies, contact the on-call technician. Always include your name and location.',
      tags: ['emergency', 'contact', 'urgent'],
      lastUpdated: '2023-12-27'
    }
  ];

  const categories = [
    { key: 'all', label: 'All Categories', icon: <Book /> },
    { key: 'ACCESS', label: 'Access & Security', icon: <Security /> },
    { key: 'NETWORK', label: 'Network & Connectivity', icon: <NetworkCheck /> },
    { key: 'SOFTWARE', label: 'Software & Applications', icon: <Computer /> },
    { key: 'HARDWARE', label: 'Hardware & Equipment', icon: <Print /> },
    { key: 'COMMUNICATION', label: 'Communication Tools', icon: <Email /> },
    { key: 'PRODUCTIVITY', label: 'Productivity & Workflow', icon: <Article /> }
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ACCESS': return <Security />;
      case 'NETWORK': return <NetworkCheck />;
      case 'SOFTWARE': return <Computer />;
      case 'HARDWARE': return <Print />;
      case 'COMMUNICATION': return <Email />;
      case 'PRODUCTIVITY': return <Article />;
      default: return <Article />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'ACCESS': return 'error';
      case 'NETWORK': return 'info';
      case 'SOFTWARE': return 'primary';
      case 'HARDWARE': return 'warning';
      case 'COMMUNICATION': return 'success';
      case 'PRODUCTIVITY': return 'secondary';
      default: return 'default';
    }
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  // Filter articles based on search term and category
  const filteredArticles = knowledgeArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout
      title="Knowledge Base"
      subtitle="Find answers to common IT questions and learn how to use our systems effectively."
      container={false}
    >
      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              {categories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Category Pills */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Browse by Category:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category.key}
              label={category.label}
              icon={category.icon}
              color={selectedCategory === category.key ? 'primary' : 'default'}
              variant={selectedCategory === category.key ? 'filled' : 'outlined'}
              onClick={() => setSelectedCategory(category.key)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      {/* Results */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
        </Typography>
      </Box>

      {/* Articles */}
      <Grid container spacing={3}>
        {filteredArticles.map((article) => (
          <Grid item xs={12} md={6} key={article.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getCategoryIcon(article.category)}
                  <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                    {article.title}
                  </Typography>
                  <Chip 
                    label={article.category} 
                    size="small" 
                    color={getCategoryColor(article.category)}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {article.content}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {article.tags.map((tag) => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleArticleClick(article)}
                  >
                    Read More
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Article Detail Dialog */}
      <Dialog 
        open={selectedArticle !== null} 
        onClose={() => setSelectedArticle(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedArticle && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getCategoryIcon(selectedArticle.category)}
                <Typography variant="h6">
                  {selectedArticle.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={selectedArticle.category} 
                  color={getCategoryColor(selectedArticle.category)}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedArticle.content}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {selectedArticle.tags.map((tag) => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedArticle(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </PageLayout>
  );
};

export default KnowledgeBase; 