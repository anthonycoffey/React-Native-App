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
  input: {
    color: '#0e0d0d',
    padding: 10,
    marginVertical: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  inputPrice: {
    color: '#0e0d0d',
    padding: 10,
    marginVertical: 5,
    borderColor: '#131313',
    borderWidth: 1,
    borderRadius: 5,
  },
  formInput: {
    backgroundColor: '#fff',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  passwordInput: {
    backgroundColor: '#fff',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 50,
  },
  inputContainer: {
    backgroundColor: '#252d3a',
    marginBottom: 16,
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#424242',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 20,
    textAlign: 'center',
    marginBottom: 32,
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
    marginBottom: 15,
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
