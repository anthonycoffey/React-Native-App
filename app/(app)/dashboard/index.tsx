import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { View } from '@/components/Themed';
import JobsList from '@/components/JobsList';
import JobsFilter from '@/components/dashboard/JobsFilter';
import { apiService, HttpError } from '@/utils/ApiService';
import { Job, PaginatedResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function JobsScreen() {
  const auth = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentScope, setCurrentScope] = useState<string>('active');
  const [currentSortBy, setCurrentSortBy] = useState<string>('-arrivalTime');

  const fetchJobs = useCallback(async (pageToFetch: number = 1) => {
    if (!auth || auth.isLoading || !auth.session || !auth.isApiAuthReady) {
      setJobs([]);
      setLoading(false);
      return;
    }

    if (pageToFetch === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    let queryString = `/jobs/mine?sortBy=${currentSortBy}&page=${pageToFetch}&limit=10`;
    if (currentScope) {
      queryString += `&scope=${currentScope}`;
    }

    try {
      const response = await apiService.get<PaginatedResponse<Job>>(queryString);
      const newJobs = response.data || [];
      const meta = response.meta;

      if (pageToFetch === 1) {
        setJobs(newJobs);
      } else {
        setJobs((prevJobs) => {
          // Prevent duplicates
          const existingIds = new Set(prevJobs.map(j => j.id));
          const uniqueNewJobs = newJobs.filter(j => !existingIds.has(j.id));
          return [...prevJobs, ...uniqueNewJobs];
        });
      }
      
      if (meta) {
        setHasMore(meta.currentPage < meta.lastPage);
        setPage(pageToFetch);
        setTotal(meta.total);
      } else {
         // Fallback if meta is missing (though it shouldn't be based on investigation)
         setHasMore(newJobs.length === 10);
         setPage(pageToFetch);
      }

    } catch (error) {
      console.log('Error fetching jobs:');
      if (error instanceof HttpError) {
        console.log(
          `Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
      } else {
        console.log('An unexpected error occurred:', error);
      }
      if (pageToFetch === 1) {
        setJobs([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [
    auth,
    currentScope,
    currentSortBy,
  ]);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !loading) {
      fetchJobs(page + 1);
    }
  }, [isLoadingMore, hasMore, loading, page, fetchJobs]);

  if (!auth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <JobsFilter
        currentScope={currentScope}
        setCurrentScope={setCurrentScope}
        currentSortBy={currentSortBy}
        setCurrentSortBy={setCurrentSortBy}
      />
      <JobsList
        jobs={jobs}
        fetchJobs={() => fetchJobs(1)}
        loading={loading}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        total={total}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
