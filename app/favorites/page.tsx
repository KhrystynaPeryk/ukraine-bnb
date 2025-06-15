'use client'

import { useEffect, useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser.ts";
import { getAuth } from "firebase/auth";
import { Listing } from "@prisma/client";
import EmptyState from "../components/EmptyState";
import FavoritesClient from "./FavoritesClient";
import Loader from "../components/Loader";

const FavoritesPage = () => {
    const { currentUser, loading: userLoading } = useCurrentUser();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFavorites = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            const auth = getAuth();
            const firebaseUser = auth.currentUser;
            
            if (!firebaseUser) {
                setError('Authentication required');
                setLoading(false);
                return;
            }

            setLoading(true); // Add loading state when refetching

            const response = await fetch('/api/favorites', {
                headers: {
                    'x-firebase-uid': firebaseUser.uid
                }
            });

            if (response.ok) {
                const data = await response.json();
                setListings(data);
                setError(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch favorites');
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userLoading) {
            fetchFavorites();
        }
    }, [currentUser, userLoading]);

    if (userLoading || loading) {
        return <Loader />;
    }

    if (!currentUser) {
        return (
            <EmptyState title="Unauthorized" subtitle="Please login" />
        );
    }

    if (error) {
        return (
            <EmptyState title="Error" subtitle={error} />
        );
    }

    if (listings.length === 0) {
        return (
            <EmptyState title="No favorites found" subtitle="Looks like you have no favorite listings" />
        );
    }

    return (
        <FavoritesClient 
            listings={listings} 
            onFavoriteChange={fetchFavorites}
        />
    );
};

export default FavoritesPage;