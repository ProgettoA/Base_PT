
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useSubscription = () => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptionData = useCallback(async () => {
    if (!currentUser) {
      setSubscription(null);
      setPlan(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    console.log('Fetching subscription for userId:', currentUser.id);

    try {
      // Query subscriptions collection filtered by userId
      const subsResult = await pb.collection('subscriptions').getList(1, 1, {
        filter: `userId="${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });

      if (subsResult.items.length > 0) {
        const activeSubscription = subsResult.items[0];
        console.log('Fetched subscription data:', activeSubscription);
        setSubscription(activeSubscription);

        if (activeSubscription.planId) {
          // Fetch plan details from plans collection using planId
          const plansResult = await pb.collection('plans').getList(1, 1, {
            filter: `id = "${activeSubscription.planId}" || Codice_piano = "${activeSubscription.planId}"`,
            $autoCancel: false
          });

          if (plansResult.items.length > 0) {
            setPlan(plansResult.items[0]);
          } else {
            setPlan(null);
          }
        } else {
          setPlan(null);
        }
      } else {
        console.log('No subscription found for userId:', currentUser.id);
        setSubscription(null);
        setPlan(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  return {
    subscription,
    plan,
    isLoading,
    error,
    refresh: fetchSubscriptionData
  };
};
