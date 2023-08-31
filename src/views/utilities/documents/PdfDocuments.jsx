import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const PdfDocument = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Download Data</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.columnHeader}>Application</Text>
        <Text style={styles.columnHeader}>Download</Text>
        <Text style={styles.columnHeader}>Dst AS Name</Text>
        <Text style={styles.columnHeader}>Dst AS Number</Text>
        <Text style={styles.columnHeader}>Dst City</Text>
      </View>
      {data.map((entry, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={styles.column}>{entry.application}</Text>
          <Text style={styles.column}>{entry.download}</Text>
          <Text style={styles.column}>{entry.dst_as_name}</Text>
          <Text style={styles.column}>{entry.dst_as_number}</Text>
          <Text style={styles.column}>{entry.dst_city}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  // ...styles from the previous example
});

export default PdfDocument;
