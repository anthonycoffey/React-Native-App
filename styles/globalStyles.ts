import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    maxWidth: 500,
    margin: 'auto',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    padding: 10,
    marginVertical: 10,
  },
  frameContainer: {
    padding: 10,
  },
  chipContainer: {
    paddingTop: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  statusContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // input and inputPrice styles removed
  inputContainer: {
    backgroundColor: 'transparent', // Changed from hardcoded '#252d3a'
    marginBottom: 16,
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  label: { // Color removed, should be handled by themed LabelText component
    fontWeight: 'bold',
    fontSize: 12,
  },
  // New theme-aware input styles
  themedFormInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12, // For dynamic height
    // Theme-dependent backgroundColor, color, borderColor to be applied in component
  },
  themedPasswordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15, // Padding for the wrapper
    position: 'relative', // For eyeIcon
    // Theme-dependent backgroundColor, borderColor to be applied in component
    // Height will be intrinsic
  },
  themedPasswordTextInput: {
    flex: 1,
    paddingVertical: 12, // Match themedFormInput's vertical padding for consistent height feel
    paddingRight: 40,    // Space for icon
    // Theme-dependent color to be applied in component
    // No explicit height, no background/border (wrapper handles it)
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    marginTop: 20,
    textAlign: 'center',
    marginBottom: 4,
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  openInMaps: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  mapButton: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  coordinates: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  button: {
    marginTop: 16,
    width: '100%',
  },
  clockButton: {
    marginTop: 16,
    width: '100%',
    paddingVertical: 14,
  },
  clockInButton: {
    backgroundColor: '#4CAF50',
  },
  clockOutButton: {
    backgroundColor: '#FF5722',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '90%',
    marginVertical: 24,
    alignSelf: 'center',
  },
  statusTitle: {
    marginTop: 24,
    fontSize: 24,
  },
  privacyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
